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
 *     of protocol state (seats issued AND SYN sold per era). No founder switch,
 *     no oracle, no timer. The only privileged power is emergency pause.
 *
 *  2. EXACT INTEGER MATH. Every era's price is an integer number of SYN per
 *     1 USDC (Genesis 100 -> Era IX 1). USDC has 6 decimals, SYN has 18, so:
 *         synOut(18dp) = usdcIn(6dp) * synPerUsdc * 1e12
 *     There is no division in the price path, hence ZERO rounding/precision
 *     loss and no rounding-favoring-buyer drain vector.
 *
 *  3. DUAL-BOUND ERAS (member range AND per-era SYN cap). Each era closes on
 *     whichever comes first: its member-range ceiling is reached, OR its SYN
 *     sold-cap can no longer fit even one minimum entry. This bounds how much
 *     cheap early-era SYN can ever be sold (anti-Sybil at the aggregate level)
 *     WITHOUT physical buckets: caps limit `soldInEra[e]` against ONE global
 *     SYN balance, so unsold early-era capacity simply remains in the pool and
 *     is available to later eras. The era engine NEVER splits a purchase across
 *     two rates: a buy is priced entirely at one era, or it reverts.
 *
 *     IMPORTANT (honesty): per-era caps PRESERVE THE DISTRIBUTION SHAPE and
 *     reduce early depletion. They do NOT by themselves guarantee that exactly
 *     1,000,000 seats are reachable — repeat/upgrade buys can consume a cap
 *     while issuing few seats, advancing the price for everyone. The configurable
 *     immutable RESERVE_THROUGH_SEAT closes this gap when set: it refuses any buy
 *     that would leave too little SYN to seat the remaining members at their OWN
 *     era minimums, so seats are guaranteed up to the chosen seat (default #10,000
 *     => Eras II–IV; #1,000,000 => the full million; 0 => off). Where the reserve
 *     does not cover a seat, "First Million" stays a TARGET bounded by funded
 *     inventory, not a guarantee. See HUMAN REVIEW J13 (cap sizing) / J16 (target).
 *
 *  4. HYBRID PROPORTIONAL PURCHASES. A buyer may pay any amount >= the era
 *     minimum and receives proportional SYN at the current era rate. Whale
 *     accumulation is bounded by THREE independent caps: per-transaction USDC,
 *     per-address-per-era USDC (sized PER ERA, maxUsdcPerAddressPerEra[1..9]),
 *     and the aggregate per-era SYN sold-cap; the optional seat-reserve
 *     (RESERVE_THROUGH_SEAT) adds a fourth, seat-preservation bound.
 *
 *  5. 70 / 20 / 10 PRESERVED, REFERRAL FROM OPERATIONS ONLY. Vault (70%) and
 *     Liquidity (20%) are NEVER diluted. A 5% referral is carved strictly out
 *     of the 10% Operations slice (i.e. half of Operations). The contract pulls
 *     the full payment in, THEN fans out; the referrer is paid by the CONTRACT
 *     inside the same buy tx, NEVER by the Operations wallet afterwards. No
 *     referrer => Operations keeps the full 10%.
 *
 *  6. CONTINUITY WITH V1 (no double-counting). Member numbers are a single
 *     global sequence. V2 is constructed with the final V1 unique-member count
 *     as an immutable offset, AND with an immutable Merkle root of all V1
 *     member addresses. A V1 member who buys (or registers) in V2 is recognized
 *     as an EXISTING member: they get NO new seat and do NOT advance the seat
 *     boundary. Identity (member #N) remains indexer-derived across both
 *     contracts; the Merkle root only prevents double-counting and enables V1
 *     members to act as referrers.
 */
contract SyndicateSaleV2 {
    // using SafeERC20 for IERC20;  // (production)

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error BadEraCaps();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error ExceedsTxMax(uint256 maxTx);
    error AddressEraCapExceeded(uint256 capRemaining);
    error EraInventoryInsufficient(uint256 eraCapRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error RecoveryTimelocked(uint256 readyAt);
    error NothingToClaim();
    error ProtectedToken();
    error AlreadyKnown();
    error InvalidProof();
    error ReserveFloorViolation(uint256 maxSynOut);

    // ----------------------------------------------- era-advance reason codes
    uint8 internal constant REASON_RANGE = 0; // member-range ceiling reached
    uint8 internal constant REASON_CAP   = 1; // era SYN sold-cap exhausted

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
    // `reason` distinguishes a NATURAL boundary open (range filled, atSeatNumber
    // == first seat of the new era) from a CAP-triggered advance (atSeatNumber
    // == the next seat to be issued, which may be mid-range).
    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber, uint8 reason);
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
    uint256 public immutable MAX_USDC_PER_TX; // per-transaction ceiling (6dp)
    // Seat-reserve target (a GLOBAL seat number). 0 = disabled; 10_000 = reserve
    // every Era II-IV seat at its OWN era minimum (RECOMMENDED default); 1_000_000
    // = full hard-reserve guaranteeing all 1,000,000 seats (Option 2 / J16). Set
    // once; the contract must be FUNDED above the initial reserve or the first buy
    // reverts. Per-era anti-whale ADDRESS caps are a mapping set in the constructor
    // (arrays cannot use the `immutable` keyword) -- see `maxUsdcPerAddressPerEra`.
    uint256 public immutable RESERVE_THROUGH_SEAT;

    uint256 private constant GENESIS_END   = 333;
    uint256 private constant FINAL_SEAT    = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;
    uint256 public  constant RECOVERY_TIMELOCK = 7 days; // delay on the PAUSED recovery path

    // ------------------------------------------------------------- ownership
    address public owner;
    address public pendingOwner;

    // ---------------------------------------------------------------- state
    bool    public paused;
    uint64  public pausedAt;          // timestamp of the last false->true pause
    uint256 public memberCount;       // global; starts at GENESIS_OFFSET
    uint256 public totalUsdcRaised;   // V2 only (6dp)
    uint256 public totalSynSold;      // V2 only (18dp)
    uint16  public activeEra;         // CURRENT sellable era (advanced, never derived-only)

    // Per-era SYN sold-caps (18dp). Immutable after construction (no setter).
    // eraSynCap[e] limits soldInEra[e]; both indexed by era 1..9.
    mapping(uint16 => uint256) public eraSynCap;
    mapping(uint16 => uint256) public soldInEra;

    // Per-era anti-whale ADDRESS caps (USDC 6dp), indexed by era 1..9. Set once
    // in the constructor (no setter). REPLACES the prior single global cap: one
    // value that was safe for a late era let a single wallet drain a tiny early
    // era, so the per-address ceiling is now sized PER ERA (tiny for the cheap
    // early eras, ~$25k-class late). Values are HUMAN REVIEW J3.
    mapping(uint16 => uint256) public maxUsdcPerAddressPerEra;

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
     * @param addrCaps       Per-era anti-whale ADDRESS caps in USDC 6dp units,
     *                       index 0..8 => era 1..9. Each SELLABLE era's cap MUST
     *                       be >= that era's USDC minimum (else no one could clear
     *                       the era min). Size tiny for the cheap early eras and
     *                       larger (~$25k-class) late (J3).
     * @param maxUsdcPerTx   Per-transaction USDC ceiling, 6dp; MUST be >= the
     *                       largest sellable era minimum (J14).
     * @param reserveThroughSeat  Seat-reserve target (a GLOBAL seat number).
     *                       0 = no reserve; 10_000 = reserve every Era II-IV seat
     *                       at its own era minimum (RECOMMENDED); 1_000_000 = full
     *                       hard-reserve for all 1M seats (Option 2 / J16). The
     *                       contract must be FUNDED with >= the resulting initial
     *                       reserve or the first buy reverts.
     * @param eraCaps        Per-era SYN sold-caps (18dp), index 0..8 => era 1..9.
     *                       Era 1 (Genesis) is unused by V2 (may be 0). Each
     *                       SELLABLE era's cap MUST fit at least one minimum
     *                       entry; recommended sizing per funding model (J13).
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
        uint256[9] memory addrCaps,
        uint256 maxUsdcPerTx,
        uint256 reserveThroughSeat,
        uint256[9] memory eraCaps
    ) {
        if (
            usdc == address(0) || syn == address(0) || vault == address(0) ||
            liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        if (genesisOffset < GENESIS_END || genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();
        if (maxUsdcPerTx == 0) revert BadEraCaps();
        // Seat-reserve target must be disabled (0) or a real future seat in
        // (GENESIS_END, FINAL_SEAT]. 10_000 = Era II-IV reserve; 1_000_000 = full.
        if (
            reserveThroughSeat != 0 &&
            (reserveThroughSeat <= GENESIS_END || reserveThroughSeat > FINAL_SEAT)
        ) revert BadEraCaps();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_TX = maxUsdcPerTx;
        RESERVE_THROUGH_SEAT = reserveThroughSeat;

        memberCount = genesisOffset;
        uint16 startEra = _eraIndexForSeat(genesisOffset + 1);
        activeEra = startEra;

        // Each SELLABLE era must: (a) have a SYN sold-cap that fits at least one
        // minimum entry (else dead-on-arrival), AND (b) have a per-address cap
        // >= its own USDC minimum (else NO buyer could ever clear the era min).
        // The per-tx ceiling must also clear the largest sellable era minimum.
        // Full sizing is J13 (SYN caps) / J3 (address caps) / J14 (per-tx).
        for (uint16 e = startEra; e <= 9; ++e) {
            (, uint256 minU,) = _eraParams(e);
            uint256 cap = eraCaps[e - 1];
            if (cap < _minEntrySyn(e)) revert BadEraCaps();
            if (addrCaps[e - 1] < minU) revert BadEraCaps();
            if (maxUsdcPerTx < minU) revert BadEraCaps();
            eraSynCap[e] = cap;
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }
        // Non-sellable lower eras (e < startEra, e.g. Genesis) keep their cap
        // values verbatim for transparency; they are never sold by V2.
        for (uint16 e = 1; e < startEra; ++e) {
            eraSynCap[e] = eraCaps[e - 1];
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }

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
     * @notice Buy SYN at the CURRENT era rate. Hybrid/proportional, single-era.
     * @param usdcIn    USDC amount (6dp). Must be >= current era minimum and
     *                  <= MAX_USDC_PER_TX, and fit the per-address-per-era cap.
     * @param referrer  Optional referrer (existing member, not self). 0 = none.
     * @param minSynOut Slippage floor.
     * @param v1Proof   Merkle proof that msg.sender is a V1 member. Pass an
     *                  EMPTY array for protocol-newcomers and already-known
     *                  members. Supplying it for a V1 member prevents a new
     *                  (double-counted) seat being issued.
     *
     *  NO SILENT SPLIT / NO PARTIAL FILL: a purchase is priced entirely at one
     *  era. If it cannot fit the active era's remaining SYN cap, it REVERTS
     *  (`EraInventoryInsufficient`) — the buyer sizes down. The era only
     *  advances between buys, automatically, via `_syncEra`.
     */
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof)
        external
        nonReentrant
        whenNotPaused
    {
        // Recognize V1 membership first so a returning V1 member is NOT minted
        // a new seat / does NOT advance the seat boundary.
        if (v1Proof.length > 0 && !knownMember[msg.sender] && _verifyV1(v1Proof, msg.sender)) {
            knownMember[msg.sender] = true;
            emit V1MembershipRecognized(msg.sender);
        }

        // Roll the era forward (emits EraAdvanced per step) and detect conclusion.
        (uint16 era, bool concluded) = _syncEra();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();

        (uint64 synPerUsdc, uint256 minUsdc6,) = _eraParams(era);
        if (usdcIn < minUsdc6) revert BelowEraMinimum(minUsdc6);
        if (usdcIn > MAX_USDC_PER_TX) revert ExceedsTxMax(MAX_USDC_PER_TX);

        // anti-whale: per-address, per-era cumulative USDC cap (sized PER ERA)
        uint256 spentThisEra = usdcByAddressEra[msg.sender][era];
        {
            uint256 addrCap = maxUsdcPerAddressPerEra[era];
            if (spentThisEra + usdcIn > addrCap) revert AddressEraCapExceeded(addrCap - spentThisEra);
        }

        // exact pricing (no division)
        uint256 synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        // per-era aggregate SYN sold-cap (NO partial fill — revert if it won't fit)
        uint256 eraRemaining = eraSynCap[era] - soldInEra[era];
        if (synOut > eraRemaining) revert EraInventoryInsufficient(eraRemaining);

        // global inventory (the contract's own funded SYN balance)
        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        // SEAT-RESERVE invariant: never sell so much SYN that the seats still to
        // be issued (up to RESERVE_THROUGH_SEAT) could no longer be seated at
        // their OWN era minimum. `firstSeat` is computed HERE (after V1
        // recognition) and REUSED in effects; a repeat / recognized-V1 buyer
        // issues no seat, so `mAfter` is unchanged. REVERT (never silent-cap) —
        // consistent with the no-partial-fill doctrine; the buyer sizes down.
        bool firstSeat = !knownMember[msg.sender];
        {
            uint256 reserveAfter = _reserveSyn(memberCount + (firstSeat ? 1 : 0));
            uint256 sellableNow = available > reserveAfter ? available - reserveAfter : 0;
            if (synOut > sellableNow) revert ReserveFloorViolation(sellableNow);
        }

        // splits (70/20/10, remainder-safe; referral from Ops only)
        uint256 vaultAmt = (usdcIn * 70) / 100;
        uint256 liqAmt = (usdcIn * 20) / 100;
        uint256 opsSlice = usdcIn - vaultAmt - liqAmt; // exact remainder == ~10%
        uint256 refAmt = 0;
        bool referralValid = referrer != address(0) && referrer != msg.sender && knownMember[referrer];
        if (referralValid) refAmt = opsSlice / 2; // fixed 5% of gross
        uint256 opsAmt = opsSlice - refAmt;

        // ================= EFFECTS (state before interactions) =============
        // `firstSeat` was computed above (reserve check) and is reused here.
        uint256 assignedNumber;
        if (firstSeat) {
            knownMember[msg.sender] = true;
            memberCount += 1;
            memberNumberOf[msg.sender] = memberCount;
            assignedNumber = memberCount;
        } else {
            // 0 for recognized V1 members (indexer is the authoritative source).
            assignedNumber = memberNumberOf[msg.sender];
        }

        soldInEra[era] += synOut;
        usdcByAddressEra[msg.sender][era] = spentThisEra + usdcIn;
        usdcContributed[msg.sender] += usdcIn;
        totalUsdcRaised += usdcIn;
        totalSynSold += synOut;

        // ================= INTERACTIONS ====================================
        // Pull the FULL payment into the contract, THEN fan out. The referrer
        // is paid by THIS CONTRACT (never by the Operations wallet afterwards).
        // Order mirrors the canonical flow: Vault -> Liquidity -> Referrer -> Ops.
        _safeTransferFrom(USDC, msg.sender, address(this), usdcIn);
        _safeTransfer(USDC, VAULT, vaultAmt);
        _safeTransfer(USDC, LIQUIDITY, liqAmt);

        bool escrowed = false;
        if (refAmt > 0) {
            // Try push; escrow on failure (e.g. USDC blacklist) so the BUY IS
            // NEVER BLOCKED by a bad referrer. opsAmt is ALREADY net of refAmt,
            // so the Operations wallet is paid its reduced slice regardless.
            try USDC.transfer(referrer, refAmt) returns (bool ok) {
                if (!ok) { referralOwed[referrer] += refAmt; escrowed = true; }
            } catch {
                referralOwed[referrer] += refAmt; escrowed = true;
            }
            emit ReferralAttributed(referrer, msg.sender, assignedNumber, refAmt, escrowed);
        }

        _safeTransfer(USDC, OPERATIONS, opsAmt);
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
        returns (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 available,
            uint256 eraCapRemaining
        )
    {
        bool concluded;
        (era, concluded) = _resolveEraView();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();
        (synPerUsdc,,) = _eraParams(era);
        synOut = usdcIn * uint256(synPerUsdc) * SCALE_6_TO_18;
        seatIfFirst = memberCount + 1;
        available = SYN.balanceOf(address(this));
        eraCapRemaining = eraSynCap[era] - soldInEra[era];
    }

    function currentEra() external view returns (uint16) {
        (uint16 era, bool concluded) = _resolveEraView();
        return concluded ? 0 : era; // 0 == concluded
    }

    function remainingEraCap(uint16 era) external view returns (uint256) {
        uint256 cap = eraSynCap[era];
        uint256 sold = soldInEra[era];
        return cap > sold ? cap - sold : 0;
    }

    function nextSeatNumber() external view returns (uint256) { return memberCount + 1; }
    function availableSyn() external view returns (uint256) { return SYN.balanceOf(address(this)); }

    /// @notice SYN currently sellable to a buyer who WOULD take a new seat,
    ///         without breaching the seat reserve (RESERVE_THROUGH_SEAT). This is
    ///         OPTIMISTIC for a new seat (the buyer's own seat is excluded from
    ///         the reserve); a repeat / recognized-V1 buyer's ceiling is one seat
    ///         LOWER. Frontends must size a buy against this AND the era + address
    ///         caps, then set `minSynOut` from `quote()`. 0 when at the floor.
    function sellableSynForNextSeat() external view returns (uint256) {
        uint256 bal = SYN.balanceOf(address(this));
        uint256 r = _reserveSyn(memberCount + 1);
        return bal > r ? bal - r : 0;
    }

    /// @notice SYN currently reserved to seat the remaining members up to
    ///         RESERVE_THROUGH_SEAT at their own era minimums. 0 when the reserve
    ///         is disabled or the target seat has already been passed.
    function currentReserveFloor() external view returns (uint256) {
        return _reserveSyn(memberCount);
    }

    function isConcluded() public view returns (bool) {
        if (memberCount >= FINAL_SEAT) return true;
        (, bool concluded) = _resolveEraView();
        return concluded;
    }

    /// @notice POSITIONAL preview only — the era a seat WOULD fall in by member
    ///         range alone. NOT the executable price: cap-triggered advances mean
    ///         the live price comes from `currentEra()`/`quote()`, not seat number.
    function eraOfSeat(uint256 seat) external pure returns (uint16) { return _eraIndexForSeat(seat); }

    // ===================================================== era engine (state)
    /// @dev Roll `activeEra` forward while the current era is closed (member
    ///      range reached OR its cap can't fit a minimum entry). Emits one
    ///      EraAdvanced per step with the triggering reason + seat. Mutating
    ///      twin of `_resolveEraView`.
    function _syncEra() internal returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) { concluded = false; break; }
            if (era == 9) { concluded = true; break; }
            uint8 reason = rangeFilled ? REASON_RANGE : REASON_CAP;
            uint256 atSeat = rangeFilled ? endSeat + 1 : memberCount + 1;
            emit EraAdvanced(era, era + 1, atSeat, reason);
            era += 1;
        }
        if (era != activeEra) activeEra = era;
    }

    /// @dev Read-only twin of `_syncEra` for views (no emit, no state write).
    function _resolveEraView() internal view returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) return (era, false);
            if (era == 9) return (9, true);
            era += 1;
        }
    }

    // ============================================================ admin (min)
    function pause() external onlyOwner {
        if (!paused) { paused = true; pausedAt = uint64(block.timestamp); }
        emit Paused(msg.sender);
    }
    function unpause() external onlyOwner {
        paused = false;
        pausedAt = 0;
        emit Unpaused(msg.sender);
    }

    /// @notice Return remaining unsold SYN to the immutable Vault. Allowed when:
    ///           - the sale has CONCLUDED (all seats issued, or era 9 inventory
    ///             can no longer fit a minimum entry); OR
    ///           - the sale has been PAUSED for at least RECOVERY_TIMELOCK
    ///             (deliberate, pre-announced wind-down — e.g. dust below any
    ///             era minimum).
    ///         The timelock blocks an instant pause+sweep; destination is
    ///         Vault-only (no discretionary owner SYN drain exists, ever). A
    ///         multisig owner is recommended (J4/J15).
    function recoverUnsoldSyn() external onlyOwner {
        bool concluded = isConcluded();
        if (!concluded) {
            if (!paused) revert NotWindingDown();
            uint256 readyAt = uint256(pausedAt) + RECOVERY_TIMELOCK;
            if (pausedAt == 0 || block.timestamp < readyAt) revert RecoveryTimelocked(readyAt);
        }
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
    // `_eraParams` (indexed by era) is THE single source; `_eraIndexForSeat`
    // derives the positional era from a seat by walking this table.
    function _eraParams(uint16 era)
        internal
        pure
        returns (uint64 synPerUsdc, uint256 minUsdc6, uint256 endSeat)
    {
        if (era == 1) return (100, 5_000_000, 333);       // Genesis (V1-only)
        if (era == 2) return (50, 10_000_000, 1_000);
        if (era == 3) return (40, 10_000_000, 3_333);
        if (era == 4) return (16, 25_000_000, 10_000);
        if (era == 5) return (12, 25_000_000, 25_000);
        if (era == 6) return (6, 50_000_000, 50_000);
        if (era == 7) return (4, 50_000_000, 100_000);
        if (era == 8) return (2, 100_000_000, 250_000);
        if (era == 9) return (1, 100_000_000, 1_000_000);
        revert SaleConcluded();
    }

    /// @dev Minimum-entry SYN (18dp) for an era: minUsdc6 * synPerUsdc * 1e12.
    function _minEntrySyn(uint16 era) internal pure returns (uint256) {
        (uint64 spu, uint256 minU,) = _eraParams(era);
        return minU * uint256(spu) * SCALE_6_TO_18;
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16) {
        for (uint16 e = 1; e <= 9; ++e) {
            (,, uint256 endSeat) = _eraParams(e);
            if (seat <= endSeat) return e;
        }
        revert SaleConcluded();
    }

    /// @dev SYN that must REMAIN to seat members (m+1 .. RESERVE_THROUGH_SEAT) at
    ///      EACH one's own era minimum. Costs every remaining reservable seat at
    ///      its era's `_minEntrySyn` — NOT a blanket current-era rate (the naive
    ///      blanket formula under/over-reserves once eras differ). O(9): iterates
    ///      eras, not seats. `view` (reads the RESERVE_THROUGH_SEAT immutable),
    ///      not `pure`. Returns 0 when the reserve is disabled or m >= target.
    function _reserveSyn(uint256 m) internal view returns (uint256 reserve) {
        uint256 target = RESERVE_THROUGH_SEAT;
        if (target == 0 || m >= target) return 0;
        uint256 prevEnd = 0;
        for (uint16 e = 1; e <= 9; ++e) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(e);
            uint256 segEnd = endSeat < target ? endSeat : target;
            uint256 already = m > prevEnd ? m : prevEnd; // already-seated lower bound
            if (segEnd > already) {
                reserve += (segEnd - already) * (minU * uint256(spu) * SCALE_6_TO_18);
            }
            prevEnd = endSeat;
            if (endSeat >= target) break;
        }
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
