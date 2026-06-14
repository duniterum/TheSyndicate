// SPDX-License-Identifier: UNLICENSED
// =============================================================================
//  SyndicateSaleV2 — DRAFT · NOT FOR DEPLOYMENT
//  The Syndicate · Membership Distribution Engine (Sale V2)
// =============================================================================
//  STATUS: UNAUDITED DESIGN DRAFT. Produced during the Sale V2 architecture
//          phase for HUMAN REVIEW ONLY.
//
//  THIS FILE MUST NOT BE:
//    - deployed to any network (mainnet OR testnet) without sign-off,
//    - wired into the frontend / contract-registry,
//    - treated as final or audited.
//
//  HARD CONSTRAINTS HONORED BY THIS DRAFT:
//    - Does NOT modify Sale V1 (0x0020Df30C127306f0F5B44E6a6E4368D2855842d).
//    - Does NOT touch the SYN token (0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170).
//    - Does NOT migrate funds. It only routes NEW USDC from NEW buys to the
//      EXISTING 70/20/10 wallets and pays SYN out of its own funded balance.
//
//  REQUIRED GATE BEFORE ANY DEPLOY (per docs/SOLIDITY_REVIEW_STATE.md +
//  docs/SMART_CONTRACT_DECISIONS_PENDING.md D4/D5):
//    external review (Kemal + ChatGPT) -> Fuji rehearsal -> independent audit
//    -> mainnet. No exceptions.
//
//  Companion design doc:
//    docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md
// =============================================================================
pragma solidity 0.8.24;

// In production, import the audited OpenZeppelin v5 base:
//   import {IERC20}        from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//   import {SafeERC20}     from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//   import {Ownable2Step}  from "@openzeppelin/contracts/access/Ownable2Step.sol";
//   import {Pausable}      from "@openzeppelin/contracts/utils/Pausable.sol";
//   import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
//   import {MerkleProof}   from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
//
// The lightweight interfaces / mixins below are placeholders so the draft reads
// as a single file. DO NOT ship these stubs — use the audited OZ libraries.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/**
 * @title  SyndicateSaleV2 (DRAFT)
 * @notice Era-stepped, automatic, immutable membership distribution engine.
 *
 *  DESIGN PILLARS
 *  --------------
 *  1. AUTOMATIC, PRESCRIPTED ERAS. The access rate steps purely as a function
 *     of how many seats have been issued (member count). No founder switch,
 *     no oracle, no timer. The only privileged power is emergency pause.
 *
 *  2. EXACT INTEGER MATH. Every era's price is an integer number of SYN per
 *     1 USDC (Genesis 100 -> Era IX 1). USDC has 6 decimals, SYN has 18, so:
 *         synOut(18dp) = usdcIn(6dp) * synPerUsdc * 1e12
 *     There is no division in the price path, hence ZERO rounding/precision
 *     loss and no rounding-favoring-buyer drain vector.
 *
 *  3. 70 / 20 / 10 PRESERVED, REFERRAL FROM OPERATIONS ONLY. Vault (70%) and
 *     Liquidity (20%) are NEVER diluted. A 5% referral is carved strictly out
 *     of the 10% Operations slice (i.e. half of Operations). No referrer =>
 *     Operations keeps the full 10%.
 *
 *  4. HYBRID PROPORTIONAL PURCHASES. A buyer may pay any amount >= the era
 *     minimum and receives proportional SYN at the current era rate. A
 *     per-address, per-era USDC cap bounds whale accumulation.
 *
 *  5. CONTINUITY WITH V1 (no double-counting). Member numbers are a single
 *     global sequence. V2 is constructed with the final V1 unique-member count
 *     as an immutable offset, AND with an immutable Merkle root of all V1
 *     member addresses. A V1 member who buys (or registers) in V2 is recognized
 *     as an EXISTING member: they get NO new seat and do NOT advance the era
 *     boundary. Identity (member #N) remains indexer-derived across both
 *     contracts; the Merkle root only prevents double-counting and enables V1
 *     members to act as referrers.
 */
contract SyndicateSaleV2 {
    // using SafeERC20 for IERC20;  // (production)

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error AddressEraCapExceeded(uint256 capRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error NothingToClaim();
    error ProtectedToken();
    error AlreadyKnown();
    error InvalidProof();

    // --------------------------------------------------------------- events
    event Purchased(
        address indexed buyer,
        uint256 indexed memberNumber,   // authoritative only when firstSeat==true
        uint16  indexed era,
        uint256 usdcIn,
        uint256 synOut,
        uint64  synPerUsdc,
        bool    firstSeat
    );
    event Routed(
        uint256 indexed memberNumber,
        uint256 vaultAmount,
        uint256 liquidityAmount,
        uint256 operationsAmount,
        uint256 referralAmount
    );
    event ReferralAttributed(
        address indexed referrer,
        address indexed buyer,
        uint256 indexed memberNumber,
        uint256 amount,
        bool    escrowed
    );
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber);
    event V1MembershipRecognized(address indexed member);
    event UnsoldSynRecovered(address indexed to, uint256 amount);
    event Paused(address account);
    event Unpaused(address account);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ----------------------------------------------------------- immutables
    IERC20  public immutable USDC;            // Avalanche native USDC (6dp)
    IERC20  public immutable SYN;             // SYN token (18dp, fixed supply)
    address public immutable VAULT;           // 70% — 0x205DdC...464
    address public immutable LIQUIDITY;       // 20% — 0xa9b0...e25
    address public immutable OPERATIONS;      // 10% — 0x5cb5...E80
    uint256 public immutable GENESIS_OFFSET;  // final V1 unique-member count
    bytes32 public immutable V1_MEMBER_ROOT;  // Merkle root of V1 member addresses
    uint256 public immutable MAX_USDC_PER_ADDRESS_PER_ERA; // anti-whale (6dp)

    uint256 private constant GENESIS_END = 333;
    uint256 private constant FINAL_SEAT  = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;

    // ------------------------------------------------------------- ownership
    address public owner;
    address public pendingOwner;

    // ---------------------------------------------------------------- state
    bool    public paused;
    uint256 public memberCount;       // global; starts at GENESIS_OFFSET
    uint256 public totalUsdcRaised;   // V2 only (6dp)
    uint256 public totalSynSold;      // V2 only (18dp)
    uint16  public lastEra;

    mapping(address => bool)    public knownMember;     // V1-proven OR V2-bought
    mapping(address => uint256) public memberNumberOf;  // set for V2-new seats only
    mapping(address => uint256) public usdcContributed; // lifetime, per address (V2)
    mapping(address => mapping(uint16 => uint256)) public usdcByAddressEra; // anti-whale
    mapping(address => uint256) public referralOwed;    // escrowed referral (6dp)

    // ----------------------------------------------------------- modifiers
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }
    modifier whenNotPaused() { require(!paused, "paused"); _; }

    uint256 private _lock = 1;
    modifier nonReentrant() {
        require(_lock == 1, "reentrant");
        _lock = 2; _; _lock = 1;
    }

    // ------------------------------------------------------------ construct
    /**
     * @param genesisOffset  Final V1 unique-member count at handoff. MUST be
     *                       >= 333 so V2 only ever sells Era II+ (Genesis is
     *                       V1-only). See HUMAN REVIEW item J1.
     * @param v1MemberRoot   Merkle root of the V1 member address set, frozen at
     *                       handoff. Lets V2 recognize V1 members without
     *                       double-counting seats. See HUMAN REVIEW item J12.
     * @param maxUsdcPerAddressPerEra  Anti-whale cap in USDC 6dp units.
     *
     *  NOTE: This constructor does NOT pull SYN. The contract must be funded
     *  with its membership-distribution SYN allocation in a SEPARATE,
     *  explicitly-authorized transaction AFTER review (honors "do not migrate
     *  funds" during the design phase).
     */
    constructor(
        address usdc,
        address syn,
        address vault,
        address liquidity,
        address operations,
        uint256 genesisOffset,
        bytes32 v1MemberRoot,
        uint256 maxUsdcPerAddressPerEra
    ) {
        if (
            usdc == address(0) || syn == address(0) || vault == address(0) ||
            liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        if (genesisOffset < GENESIS_END || genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_ADDRESS_PER_ERA = maxUsdcPerAddressPerEra;

        memberCount = genesisOffset;
        lastEra = _eraIndexForSeat(genesisOffset + 1);

        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // =================================================== V1 recognition
    /// @notice Register as an existing V1 member (e.g. to act as a referrer)
    ///         without buying. Idempotent; reverts if already known or proof bad.
    function claimV1Membership(bytes32[] calldata proof) external {
        if (knownMember[msg.sender]) revert AlreadyKnown();
        if (!_verifyV1(proof, msg.sender)) revert InvalidProof();
        knownMember[msg.sender] = true;
        emit V1MembershipRecognized(msg.sender);
    }

    // ============================================================ purchase
    /**
     * @notice Buy SYN at the CURRENT era rate. Hybrid/proportional.
     * @param usdcIn    USDC amount (6dp). Must be >= current era minimum.
     * @param referrer  Optional referrer (existing member, not self). 0 = none.
     * @param minSynOut Slippage floor.
     * @param v1Proof   Merkle proof that msg.sender is a V1 member. Pass an
     *                  EMPTY array for protocol-newcomers and already-known
     *                  members. Supplying it for a V1 member prevents a new
     *                  (double-counted) seat being issued.
     */
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)
        external
        nonReentrant
        whenNotPaused
    {
        // Recognize V1 membership first so a returning V1 member is NOT minted
        // a new seat / does NOT advance the era boundary.
        if (v1Proof.length > 0 && !knownMember[msg.sender] && _verifyV1(v1Proof, msg.sender)) {
            knownMember[msg.sender] = true;
            emit V1MembershipRecognized(msg.sender);
        }

        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) revert SaleConcluded();

        (uint16 era, uint64 synPerUsdc, uint256 minUsdc6) = _eraInfoForSeat(nextSeat);
        if (usdcIn < minUsdc6) revert BelowEraMinimum(minUsdc6);

        // anti-whale: per-address, per-era cumulative USDC cap
        uint256 spentThisEra = usdcByAddressEra[msg.sender][era];
        if (spentThisEra + usdcIn > MAX_USDC_PER_ADDRESS_PER_ERA) {
            revert AddressEraCapExceeded(MAX_USDC_PER_ADDRESS_PER_ERA - spentThisEra);
        }

        // exact pricing (no division)
        uint256 synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        // splits (70/20/10, remainder-safe; referral from Ops only)
        uint256 vaultAmt = (usdcIn * 70) / 100;
        uint256 liqAmt = (usdcIn * 20) / 100;
        uint256 opsSlice = usdcIn - vaultAmt - liqAmt; // exact remainder == ~10%
        uint256 refAmt = 0;
        bool referralValid = referrer != address(0) && referrer != msg.sender && knownMember[referrer];
        if (referralValid) refAmt = opsSlice / 2; // fixed 5% of gross
        uint256 opsAmt = opsSlice - refAmt;

        // ================= EFFECTS (state before interactions) =============
        bool firstSeat = !knownMember[msg.sender];
        uint256 assignedNumber;
        if (firstSeat) {
            knownMember[msg.sender] = true;
            memberCount = nextSeat;
            memberNumberOf[msg.sender] = nextSeat;
            assignedNumber = nextSeat;
        } else {
            // 0 for recognized V1 members (indexer is the authoritative source).
            assignedNumber = memberNumberOf[msg.sender];
        }

        usdcByAddressEra[msg.sender][era] = spentThisEra + usdcIn;
        usdcContributed[msg.sender] += usdcIn;
        totalUsdcRaised += usdcIn;
        totalSynSold += synOut;

        // Automatic era-advance: report the seat at which the new era opened.
        if (era != lastEra) {
            emit EraAdvanced(lastEra, era, nextSeat);
            lastEra = era;
        }

        // ================= INTERACTIONS ====================================
        _safeTransferFrom(USDC, msg.sender, address(this), usdcIn);
        _safeTransfer(USDC, VAULT, vaultAmt);
        _safeTransfer(USDC, LIQUIDITY, liqAmt);
        _safeTransfer(USDC, OPERATIONS, opsAmt);

        bool escrowed = false;
        if (refAmt > 0) {
            // Try push; escrow on failure (e.g. USDC blacklist) so the BUY IS
            // NEVER BLOCKED by a bad referrer.
            try USDC.transfer(referrer, refAmt) returns (bool ok) {
                if (!ok) { referralOwed[referrer] += refAmt; escrowed = true; }
            } catch {
                referralOwed[referrer] += refAmt; escrowed = true;
            }
            emit ReferralAttributed(referrer, msg.sender, assignedNumber, refAmt, escrowed);
        }

        _safeTransfer(SYN, msg.sender, synOut);

        emit Routed(assignedNumber, vaultAmt, liqAmt, opsAmt, refAmt);
        emit Purchased(msg.sender, assignedNumber, era, usdcIn, synOut, synPerUsdc, firstSeat);
    }

    /// @notice Referrer claims any escrowed commission (pull fallback).
    function claimReferral() external nonReentrant {
        uint256 amt = referralOwed[msg.sender];
        if (amt == 0) revert NothingToClaim();
        referralOwed[msg.sender] = 0;
        _safeTransfer(USDC, msg.sender, amt);
        emit ReferralClaimed(msg.sender, amt);
    }

    // ================================================================ views
    function quote(uint256 usdcIn)
        external
        view
        returns (uint256 synOut, uint16 era, uint64 synPerUsdc, uint256 seatIfFirst, uint256 available)
    {
        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) revert SaleConcluded();
        uint256 minUsdc6;
        (era, synPerUsdc, minUsdc6) = _eraInfoForSeat(nextSeat);
        synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        seatIfFirst = nextSeat;
        available = SYN.balanceOf(address(this));
    }

    function currentEra() external view returns (uint16) {
        uint256 nextSeat = memberCount + 1;
        if (nextSeat > FINAL_SEAT) return 0; // 0 == concluded
        return _eraIndexForSeat(nextSeat);
    }

    function nextSeatNumber() external view returns (uint256) { return memberCount + 1; }
    function availableSyn() external view returns (uint256) { return SYN.balanceOf(address(this)); }
    function isConcluded() public view returns (bool) { return memberCount >= FINAL_SEAT; }
    function eraOfSeat(uint256 seat) external pure returns (uint16) { return _eraIndexForSeat(seat); }

    // ============================================================ admin (min)
    function pause() external onlyOwner { paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }

    /// @notice Return remaining unsold SYN to the immutable Vault. Allowed only
    ///         when the sale has concluded (all seats issued) OR is paused
    ///         (deliberate wind-down — e.g. inventory dust below any era
    ///         minimum). Destination is Vault-only: no discretionary SYN drain
    ///         to the owner exists, paused or not.
    function recoverUnsoldSyn() external onlyOwner {
        if (!isConcluded() && !paused) revert NotWindingDown();
        uint256 bal = SYN.balanceOf(address(this));
        _safeTransfer(SYN, VAULT, bal);
        emit UnsoldSynRecovered(VAULT, bal);
    }

    /// @notice Rescue tokens sent here by mistake. CANNOT touch USDC or SYN.
    ///         Destination is the immutable Vault.
    function rescueToken(address token) external onlyOwner {
        if (token == address(USDC) || token == address(SYN)) revert ProtectedToken();
        IERC20 t = IERC20(token);
        _safeTransfer(t, VAULT, t.balanceOf(address(this)));
    }

    // 2-step ownership (use OZ Ownable2Step in prod).
    function transferOwnership(address newOwner) external onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        address prev = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(prev, owner);
    }

    // ====================================================== era schedule (pure)
    // IMMUTABLE, hardcoded in bytecode. Boundaries are GLOBAL seat numbers and
    // match src/lib/eras.ts exactly. synPerUsdc is an exact integer per era.
    function _eraInfoForSeat(uint256 seat)
        internal
        pure
        returns (uint16 era, uint64 synPerUsdc, uint256 minUsdc6)
    {
        if (seat <= 333)       return (1, 100, 5_000_000);   // Genesis (V1-only)
        if (seat <= 1_000)     return (2, 50, 10_000_000);
        if (seat <= 3_333)     return (3, 40, 10_000_000);
        if (seat <= 10_000)    return (4, 16, 25_000_000);
        if (seat <= 25_000)    return (5, 12, 25_000_000);
        if (seat <= 50_000)    return (6, 6, 50_000_000);
        if (seat <= 100_000)   return (7, 4, 50_000_000);
        if (seat <= 250_000)   return (8, 2, 100_000_000);
        if (seat <= 1_000_000) return (9, 1, 100_000_000);
        revert SaleConcluded();
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16 era) {
        (era,,) = _eraInfoForSeat(seat);
    }

    // ===================================================== merkle (stub)
    // Production: replace with OpenZeppelin MerkleProof.verify and a
    // standardized double-hashed leaf. This sorted-pair stub is illustrative.
    function _verifyV1(bytes32[] calldata proof, address who) internal view returns (bool) {
        if (V1_MEMBER_ROOT == bytes32(0)) return false;
        bytes32 h = keccak256(abi.encodePacked(who));
        for (uint256 i; i < proof.length; ++i) {
            bytes32 p = proof[i];
            h = h <= p ? keccak256(abi.encodePacked(h, p)) : keccak256(abi.encodePacked(p, h));
        }
        return h == V1_MEMBER_ROOT;
    }

    // ===================================================== safe ERC20 (stub)
    // Production: replace with OpenZeppelin SafeERC20.
    function _safeTransfer(IERC20 token, address to, uint256 amount) private {
        if (amount == 0) return;
        require(token.transfer(to, amount), "transfer failed");
    }
    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) private {
        require(token.transferFrom(from, to, amount), "transferFrom failed");
    }
}
