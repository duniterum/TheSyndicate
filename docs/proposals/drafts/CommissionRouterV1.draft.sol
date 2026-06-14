// SPDX-License-Identifier: UNLICENSED
// =============================================================================
//  CommissionRouterV1 — DRAFT · NOT FOR DEPLOYMENT
//  The Syndicate · Referral Commission Router (companion to SyndicateSaleV2)
// =============================================================================
//  STATUS: UNAUDITED DESIGN DRAFT. Produced during the Sale V2 architecture
//          phase for HUMAN REVIEW ONLY.
//
//  THIS FILE MUST NOT BE:
//    - deployed to any network (mainnet OR testnet) without sign-off,
//    - wired into the frontend / contract-registry,
//    - treated as final or audited.
//
//  SCOPE (deliberately narrow): this contract owns referral ROUTING ONLY.
//    - It receives the Operations slice (10%) from an allow-listed sale, pays the
//      referrer a tier-based commission carved STRICTLY from that slice, and
//      forwards the remainder to the sale's Operations wallet.
//    - It NEVER touches the Vault (70%) or Liquidity (20%) slices — those are paid
//      in full by the sale BEFORE it ever calls this router.
//    - It computes NO reputation / retention / durability / Builder-Record math.
//      Those are OFF-CHAIN / indexer read-models, fed by this contract's
//      RAL-compatible `Attribution` events. (Founder doctrine items 5/6.)
//    - No oracle. No upgradeable proxy. Tightly-controlled, mostly-immutable params.
//
//  TIER LADDER (count-only axis) is the canonical referral ladder recovered
//  verbatim from src/lib/preview/referral.ts — NO new economics invented:
//      Signal     count >=   0  -> 30% of the Operations slice
//      Advocate   count >=   5  -> 40%
//      Connector  count >=  20  -> 55%
//      Catalyst   count >=  50  -> 70%
//      Ambassador count >= 100  -> 80%
//  `commissionPct` is a PERCENT OF THE OPERATIONS SLICE (10% of gross), NOT of
//  gross. retentionRequiredPct from the source is INTENTIONALLY NOT enforced
//  on-chain in V1 — it is a future off-chain read-model gate, never a payout gate
//  (only data "safely knowable on-chain" gates a live payout; founder doctrine 4).
//
//  Companion files:
//    docs/proposals/drafts/SyndicateSaleV2.draft.sol
//    docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md (§D, §L, §R)
//    docs/REVENUE_ATTRIBUTION_LAYER.md (the RAL event doctrine this satisfies)
// =============================================================================
pragma solidity 0.8.24;

// In production, import the audited OpenZeppelin v5 base:
//   import {IERC20}       from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
//   import {SafeERC20}    from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//   import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
//   import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// The lightweight interfaces / mixins below are placeholders so the draft reads
// as a single file. DO NOT ship these stubs — use the audited OZ libraries.

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @notice Membership-eligibility view the calling source (sale) MUST expose. The
///         router validates a referrer against the SALE that called it
///         (`msg.sender`) — the on-chain source of membership truth. No off-chain
///         trust enters money routing (founder doctrine item 8).
interface IMembershipRegistry {
    function knownMember(address account) external view returns (bool);
}

/// @notice Routing payload handed in by an allow-listed source. This struct is
///         duplicated byte-for-byte in SyndicateSaleV2.draft.sol — keep them in
///         lockstep (a mismatch is an ABI break, caught at integration).
struct CommissionRouteInput {
    address buyer;            // the purchaser (used for self-referral check)
    address referrer;         // named referrer (0 = none); re-validated here
    uint256 gross;            // full USDC paid by the buyer (6dp) — for the event
    uint256 vaultAmount;      // 70% slice the sale already paid — for the event
    uint256 liquidityAmount;  // 20% slice the sale already paid — for the event
    uint256 opsSlice;         // 10% Operations slice the router will distribute
    bool    firstSeat;        // true iff this buy issues a NEW member seat
    bytes32 campaign;         // reserved (registered campaign id); 0 in V1
    bytes32 refTag;           // reserved (raw analytics tag); 0 in V1
}

/**
 * @title  CommissionRouterV1 (DRAFT)
 * @notice Tier-based referral router for The Syndicate's membership sale. Pays
 *         referral commission out of the Operations slice ONLY, escrows on push
 *         failure, tracks a count-only tier axis, and emits a full RAL-compatible
 *         `Attribution` event so downstream Reputation / Builder-Record read-models
 *         are never starved. Governance (Ownable2Step / multisig) allow-lists the
 *         sources that may call `route`.
 */
contract CommissionRouterV1 {
    // using SafeERC20 for IERC20; // (production)

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error NotAuthorizedSource();
    error SourceExists();
    error UnknownSource();
    error NothingToClaim();
    error OpsCapExceeded();   // defensive: referral must never exceed the Ops slice
    error PullFailed();       // transferFrom of the Operations slice failed

    // ----------------------------------------------- mode codes (event fields)
    uint8 internal constant MODE_PUSH        = 0; // commission pushed in-tx
    uint8 internal constant MODE_ESCROW      = 1; // commission escrowed (claimable)
    uint8 internal constant ATTR_LAST_VERIFIED = 0; // last-verified-referrer model
    // uint8 internal constant ATTR_BUYER_OVERRIDE = 1; // reserved for V2+ override

    // --------------------------------------------------------------- events
    /// @notice The canonical, indexer-first RAL attribution event. Carries enough
    ///         data to reconstruct the full money movement AND to power future
    ///         Reputation / Builder-Record projections without re-reading the sale.
    ///         splits = [vault, liquidity, referrer, operations, protocol].
    event Attribution(
        bytes32 indexed source,        // sourceId of the calling sale
        address indexed buyer,
        address indexed referrer,      // address(0) when no valid referral
        bytes32 campaign,              // reserved (0 in V1)
        bytes32 refTag,                // reserved (0 in V1)
        address token,                 // payout token (USDC)
        uint256 gross,                 // full USDC paid by the buyer
        uint16  tier,                  // referrer tier index 0..4 (0 = none/Signal)
        uint256[5] splits,             // [vault, liquidity, referrer, operations, protocol]
        uint8   paymentMode,           // 0 push, 1 escrow
        uint8   attributionMode        // 0 last-verified (1 buyer-override reserved)
    );
    event ReferralEscrowed(address indexed referrer, uint256 amount);
    event ReferralClaimed(address indexed referrer, uint256 amount);
    event ReferredCountIncremented(address indexed referrer, uint256 newCount);
    event SourceAdded(address indexed caller, bytes32 indexed sourceId, address operationsWallet);
    event SourceRemoved(address indexed caller, bytes32 indexed sourceId);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ----------------------------------------------------------- immutables
    IERC20 public immutable USDC; // payout token (Avalanche native USDC, 6dp)

    // ------------------------------------------------------------- ownership
    address public owner;
    address public pendingOwner;

    // ----------------------------------------------------------------- state
    // Governance allow-list: which callers (sales) may invoke `route`, the
    // sourceId stamped on their events, and WHERE their Operations remainder is
    // forwarded. Destinations are governance-set here, never passed by the caller.
    struct Source { bytes32 sourceId; address operationsWallet; bool enabled; }
    mapping(address => Source) public sources; // caller (sale) => source config

    // Protocol-wide VERIFIED referred-member count per referrer. This is the ONLY
    // tier axis (count-only) and the only thing that is safely knowable on-chain.
    mapping(address => uint256) public referredCount;

    // Escrowed commission (USDC 6dp) pending a pull via claimReferral().
    mapping(address => uint256) public referralOwed;

    // ----------------------------------------------------------- modifiers
    modifier onlyOwner() { require(msg.sender == owner, "not owner"); _; }

    uint256 private _lock = 1;
    modifier nonReentrant() {
        require(_lock == 1, "reentrant");
        _lock = 2; _; _lock = 1;
    }

    // ------------------------------------------------------------ construct
    constructor(address usdc) {
        if (usdc == address(0)) revert ZeroAddress();
        USDC = IERC20(usdc);
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ========================================================== governance
    /// @notice Allow-list a source (sale) that may call `route`. `operationsWallet`
    ///         is the governance-controlled destination for that source's
    ///         Operations remainder. Reverts if already enabled.
    function addSource(address caller, bytes32 sourceId, address operationsWallet)
        external
        onlyOwner
    {
        if (caller == address(0) || operationsWallet == address(0)) revert ZeroAddress();
        if (sources[caller].enabled) revert SourceExists();
        sources[caller] = Source({ sourceId: sourceId, operationsWallet: operationsWallet, enabled: true });
        emit SourceAdded(caller, sourceId, operationsWallet);
    }

    /// @notice Remove a source's authorization (instant — removing trust is safe).
    function removeSource(address caller) external onlyOwner {
        Source memory s = sources[caller];
        if (!s.enabled) revert UnknownSource();
        delete sources[caller];
        emit SourceRemoved(caller, s.sourceId);
    }

    // =============================================================== routing
    /**
     * @notice Route ONE membership sale's Operations slice. Called by an
     *         allow-listed source AFTER it has paid Vault & Liquidity in full and
     *         pulled the buyer's USDC into itself. The router PULLS exactly
     *         `opsSlice` from the caller via `transferFrom` (the caller pre-approved
     *         this router), pays the referrer a tier-based commission carved from
     *         that slice (push, escrow on failure), and forwards the remainder to
     *         the source's Operations wallet.
     *
     *  INVARIANTS
     *  ----------
     *   - Vault / Liquidity are NEVER referenced here (only echoed into the event).
     *   - referrerAmount <= opsSlice ALWAYS (max tier 80% < 100%); asserted.
     *   - referrerAmount + operationsAmount == opsSlice (no dust, no leakage).
     *   - referredCount increments ONLY on a VALID, FIRST-SEAT referral.
     *   - A revert here reverts the `transferFrom` pull in the SAME frame, so the
     *     caller's `try/catch` can safely re-route the untouched slice (fallback).
     *
     * @return referrerAmount   commission ATTRIBUTED to the referrer (pushed OR
     *                          escrowed). 0 when there is no valid referral.
     * @return operationsAmount Operations remainder forwarded to the source wallet.
     */
    function route(CommissionRouteInput calldata p)
        external
        nonReentrant
        returns (uint256 referrerAmount, uint256 operationsAmount)
    {
        Source memory src = sources[msg.sender];
        if (!src.enabled) revert NotAuthorizedSource();

        // ---- eligibility: distinct, non-zero, on-chain-known member ----------
        bool valid =
            p.referrer != address(0) &&
            p.referrer != p.buyer &&
            IMembershipRegistry(msg.sender).knownMember(p.referrer);

        // ---- tier snapshot from the CURRENT verified count (count-only) ------
        uint16 tier;
        if (valid) {
            uint16 opsPct;
            (tier, opsPct) = _tierFor(referredCount[p.referrer]);
            referrerAmount = (p.opsSlice * opsPct) / 100;
            if (referrerAmount > p.opsSlice) revert OpsCapExceeded(); // unreachable; defensive
        }
        operationsAmount = p.opsSlice - referrerAmount;

        // ---- pull EXACTLY the Operations slice the caller routes -------------
        if (!USDC.transferFrom(msg.sender, address(this), p.opsSlice)) revert PullFailed();

        // ---- EFFECTS: count a referral only on a VALID FIRST-SEAT buy --------
        if (valid && p.firstSeat) {
            unchecked { referredCount[p.referrer] += 1; }
            emit ReferredCountIncremented(p.referrer, referredCount[p.referrer]);
        }

        // ---- INTERACTIONS: pay referrer (push, escrow on failure) -----------
        uint8 paymentMode = MODE_PUSH;
        if (referrerAmount > 0) {
            try USDC.transfer(p.referrer, referrerAmount) returns (bool ok) {
                if (!ok) {
                    referralOwed[p.referrer] += referrerAmount;
                    paymentMode = MODE_ESCROW;
                    emit ReferralEscrowed(p.referrer, referrerAmount);
                }
            } catch {
                referralOwed[p.referrer] += referrerAmount;
                paymentMode = MODE_ESCROW;
                emit ReferralEscrowed(p.referrer, referrerAmount);
            }
        }

        // ---- forward the Operations remainder to the source's Ops wallet -----
        if (operationsAmount > 0) {
            require(USDC.transfer(src.operationsWallet, operationsAmount), "ops transfer failed");
        }

        // ---- canonical RAL Attribution event --------------------------------
        uint256[5] memory splits;
        splits[0] = p.vaultAmount;
        splits[1] = p.liquidityAmount;
        splits[2] = referrerAmount;
        splits[3] = operationsAmount;
        splits[4] = 0; // protocol slice (reserved; none in V1)
        emit Attribution(
            src.sourceId,
            p.buyer,
            valid ? p.referrer : address(0),
            p.campaign,
            p.refTag,
            address(USDC),
            p.gross,
            tier,
            splits,
            paymentMode,
            ATTR_LAST_VERIFIED
        );
    }

    /// @notice Withdraw escrowed commission (pull fallback).
    function claimReferral() external nonReentrant {
        uint256 amt = referralOwed[msg.sender];
        if (amt == 0) revert NothingToClaim();
        referralOwed[msg.sender] = 0;
        require(USDC.transfer(msg.sender, amt), "claim transfer failed");
        emit ReferralClaimed(msg.sender, amt);
    }

    // ================================================================= views
    /// @notice The canonical referral tier ladder (count-only axis), recovered
    ///         verbatim from src/lib/preview/referral.ts. Returns the tier index
    ///         (0..4) and the commission as a PERCENT OF THE OPERATIONS SLICE.
    ///         retentionRequiredPct is deliberately NOT modeled here (off-chain).
    function _tierFor(uint256 count) internal pure returns (uint16 tier, uint16 opsPct) {
        if (count >= 100) return (4, 80); // Ambassador
        if (count >= 50)  return (3, 70); // Catalyst
        if (count >= 20)  return (2, 55); // Connector
        if (count >= 5)   return (1, 40); // Advocate
        return (0, 30);                   // Signal
    }

    /// @notice External preview of the tier + Operations-percent for a raw count.
    function tierFor(uint256 count) external pure returns (uint16 tier, uint16 opsPct) {
        return _tierFor(count);
    }

    /// @notice Preview a referrer's CURRENT commission on a hypothetical Operations
    ///         slice (does NOT account for this transaction's potential increment).
    function quoteCommission(address referrer, uint256 opsSlice)
        external
        view
        returns (uint16 tier, uint16 opsPct, uint256 referrerAmount)
    {
        (tier, opsPct) = _tierFor(referredCount[referrer]);
        referrerAmount = (opsSlice * opsPct) / 100;
    }

    /// @notice Whether `caller` is an allow-listed source, plus its config.
    function sourceConfig(address caller)
        external
        view
        returns (bool enabled, bytes32 sourceId, address operationsWallet)
    {
        Source memory s = sources[caller];
        return (s.enabled, s.sourceId, s.operationsWallet);
    }

    // ====================================================== 2-step ownership
    // (use OpenZeppelin Ownable2Step in production; multisig owner recommended)
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
}
