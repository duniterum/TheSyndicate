// SPDX-License-Identifier: UNLICENSED
// =============================================================================
//  SourceRegistryV1 - V3 CANDIDATE (not deployed, not activated)
//  The Syndicate - Source Terms Registry for MembershipSaleV3
// =============================================================================
//  STATUS: Implementation candidate for docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md.
//          This contract stores source policy terms only. It does not move funds,
//          mint SYN, count seats, issue claims, or activate referral UI.
//
//  PURPOSE
//  -------
//  V3 needs an autonomous acquisition engine, but the protocol cannot infer
//  whether a wallet is a public member introduction, builder source, agency,
//  partner, institution, campaign, or compromised source. This registry makes
//  those source terms explicit, bounded, visible, and event-auditable.
//
//  Money remains downstream in MembershipSaleV3:
//      gross USDC -> acquisition cost -> protocol contribution -> 70 / 20 / 10
//
//  This registry only answers:
//      Is this source known?
//      What class is it?
//      What commission bps may Sale V3 apply?
//      Is it active, paused, or revoked?
//      What window/cap/payout/metadata terms apply?
// =============================================================================
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract SourceRegistryV1 is Ownable2Step {
    // --------------------------------------------------------------- constants
    uint16 public constant BPS_DENOMINATOR = 10_000;
    uint16 public constant MAX_COMMISSION_BPS = 3_000;       // 30% absolute V3 cap
    uint16 public constant MAX_MEMBER_INTRO_BPS = 1_200;     // public member-introduction cap
    uint16 public constant PUBLIC_AUTOMATIC_MAX_BPS = 1_200; // public automatic cap

    // --------------------------------------------------------------- enums
    enum SourceClass {
        MEMBER_INTRODUCTION,
        BUILDER_SOURCE,
        AFFILIATE,
        BD_NETWORK,
        WHITELABEL,
        SPONSORSHIP,
        TREASURY_DEAL
    }

    enum SourceStatus {
        NONE,
        ACTIVE,
        PAUSED,
        REVOKED
    }

    enum AttributionScope {
        FIRST_PURCHASE,
        WINDOWED,
        CAPPED,
        LIFETIME,
        CUSTOM
    }

    // --------------------------------------------------------------- structs
    struct SourceRecord {
        address sourceWallet;
        SourceClass sourceClass;
        uint16 commissionBps;
        SourceStatus status;
        AttributionScope scope;
        uint64 startTime;
        uint64 endTime;
        uint256 grossCap;
        uint256 perBuyerCap;
        bool appliesToRepeatPurchases;
        address payoutWallet;
        bytes32 metadataHash;
        address createdBy;
        uint64 updatedAt;
    }

    struct SourceTerms {
        address sourceWallet;
        SourceClass sourceClass;
        uint16 commissionBps;
        AttributionScope scope;
        uint64 startTime;
        uint64 endTime;
        uint256 grossCap;
        uint256 perBuyerCap;
        bool appliesToRepeatPurchases;
        address payoutWallet;
        bytes32 metadataHash;
    }

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error ZeroSourceId();
    error SourceExists();
    error UnknownSource();
    error InvalidCommission();
    error InvalidStatus();
    error InvalidWindow();
    error InvalidScope();
    error MissingMetadata();
    error SourceWalletMismatch();
    error PayoutWalletChangeRequiresRecovery();

    // --------------------------------------------------------------- events
    event SourceCreated(
        bytes32 indexed sourceId,
        address indexed sourceWallet,
        uint8 indexed sourceClass,
        uint16 commissionBps,
        uint8 status,
        uint8 scope,
        address payoutWallet,
        bytes32 metadataHash
    );

    event SourceTermsUpdated(
        bytes32 indexed sourceId,
        address indexed sourceWallet,
        uint8 indexed sourceClass,
        uint16 commissionBps,
        uint8 scope,
        uint64 startTime,
        uint64 endTime,
        uint256 grossCap,
        uint256 perBuyerCap,
        bool appliesToRepeatPurchases,
        address payoutWallet,
        bytes32 metadataHash
    );

    event SourceStatusChanged(bytes32 indexed sourceId, uint8 previousStatus, uint8 newStatus);
    event SourceWalletUpdated(bytes32 indexed sourceId, address previousWallet, address newWallet);
    event SourcePayoutWalletUpdated(bytes32 indexed sourceId, address previousWallet, address newWallet);

    // Future Sale V3 or indexer events. Declared here to freeze the event names,
    // but this registry does not emit attribution lifecycle events itself.
    event SourceCapReached(bytes32 indexed sourceId, uint256 grossCap, uint256 projectedGross);
    event SourceAttributionLinked(bytes32 indexed sourceId, address indexed buyer, uint64 expiresAt);
    event SourceAttributionExpired(bytes32 indexed sourceId, address indexed buyer);

    // ----------------------------------------------------------------- state
    mapping(bytes32 => SourceRecord) private _sources;

    // ------------------------------------------------------------ construct
    constructor() Ownable(msg.sender) {}

    // ========================================================== governance
    function createSource(bytes32 sourceId, SourceTerms calldata terms) external onlyOwner {
        if (sourceId == bytes32(0)) revert ZeroSourceId();
        if (_sources[sourceId].sourceWallet != address(0)) revert SourceExists();
        _validateTerms(terms);

        _sources[sourceId] = SourceRecord({
            sourceWallet: terms.sourceWallet,
            sourceClass: terms.sourceClass,
            commissionBps: terms.commissionBps,
            status: SourceStatus.ACTIVE,
            scope: terms.scope,
            startTime: terms.startTime,
            endTime: terms.endTime,
            grossCap: terms.grossCap,
            perBuyerCap: terms.perBuyerCap,
            appliesToRepeatPurchases: terms.appliesToRepeatPurchases,
            payoutWallet: terms.payoutWallet,
            metadataHash: terms.metadataHash,
            createdBy: msg.sender,
            updatedAt: uint64(block.timestamp)
        });

        emit SourceCreated(
            sourceId,
            terms.sourceWallet,
            uint8(terms.sourceClass),
            terms.commissionBps,
            uint8(SourceStatus.ACTIVE),
            uint8(terms.scope),
            terms.payoutWallet,
            terms.metadataHash
        );
    }

    function updateSourceTerms(bytes32 sourceId, SourceTerms calldata terms) external onlyOwner {
        SourceRecord storage record = _requireSource(sourceId);
        _validateTerms(terms);
        if (terms.sourceWallet != record.sourceWallet) revert SourceWalletMismatch();
        if (terms.payoutWallet != record.payoutWallet) revert PayoutWalletChangeRequiresRecovery();

        record.sourceClass = terms.sourceClass;
        record.commissionBps = terms.commissionBps;
        record.scope = terms.scope;
        record.startTime = terms.startTime;
        record.endTime = terms.endTime;
        record.grossCap = terms.grossCap;
        record.perBuyerCap = terms.perBuyerCap;
        record.appliesToRepeatPurchases = terms.appliesToRepeatPurchases;
        record.payoutWallet = terms.payoutWallet;
        record.metadataHash = terms.metadataHash;
        record.updatedAt = uint64(block.timestamp);

        emit SourceTermsUpdated(
            sourceId,
            terms.sourceWallet,
            uint8(terms.sourceClass),
            terms.commissionBps,
            uint8(terms.scope),
            terms.startTime,
            terms.endTime,
            terms.grossCap,
            terms.perBuyerCap,
            terms.appliesToRepeatPurchases,
            terms.payoutWallet,
            terms.metadataHash
        );
    }

    function updateSourceWallet(bytes32 sourceId, address newSourceWallet) external onlyOwner {
        if (newSourceWallet == address(0)) revert ZeroAddress();
        SourceRecord storage record = _requireSource(sourceId);
        address previous = record.sourceWallet;
        record.sourceWallet = newSourceWallet;
        record.updatedAt = uint64(block.timestamp);
        emit SourceWalletUpdated(sourceId, previous, newSourceWallet);
    }

    function setSourceStatus(bytes32 sourceId, SourceStatus status) external onlyOwner {
        if (status == SourceStatus.NONE) revert InvalidStatus();
        SourceRecord storage record = _requireSource(sourceId);
        SourceStatus previous = record.status;
        record.status = status;
        record.updatedAt = uint64(block.timestamp);
        emit SourceStatusChanged(sourceId, uint8(previous), uint8(status));
    }

    function updatePayoutWallet(bytes32 sourceId, address newPayoutWallet) external onlyOwner {
        if (newPayoutWallet == address(0)) revert ZeroAddress();
        SourceRecord storage record = _requireSource(sourceId);
        address previous = record.payoutWallet;
        record.payoutWallet = newPayoutWallet;
        record.updatedAt = uint64(block.timestamp);
        emit SourcePayoutWalletUpdated(sourceId, previous, newPayoutWallet);
    }

    // =============================================================== reads
    function sourceConfig(bytes32 sourceId) external view returns (SourceRecord memory) {
        return _sources[sourceId];
    }

    function sourceExists(bytes32 sourceId) external view returns (bool) {
        return _sources[sourceId].sourceWallet != address(0);
    }

    function isActive(bytes32 sourceId) external view returns (bool) {
        SourceRecord memory record = _sources[sourceId];
        return _isActive(record);
    }

    /// @notice Sale V3 helper. The sale supplies projected gross totals after
    ///         the current purchase. This registry does not store accounting.
    function attributionTerms(bytes32 sourceId, uint256 projectedSourceGross, uint256 projectedBuyerGross)
        external
        view
        returns (
            bool eligible,
            uint16 commissionBps,
            address payoutWallet,
            SourceClass sourceClass,
            AttributionScope scope,
            SourceStatus status
        )
    {
        SourceRecord memory record = _sources[sourceId];
        sourceClass = record.sourceClass;
        scope = record.scope;
        status = record.status;

        if (!_isActive(record)) return (false, 0, address(0), sourceClass, scope, status);
        if (record.grossCap != 0 && projectedSourceGross > record.grossCap) {
            return (false, 0, address(0), sourceClass, scope, status);
        }
        if (record.perBuyerCap != 0 && projectedBuyerGross > record.perBuyerCap) {
            return (false, 0, address(0), sourceClass, scope, status);
        }

        return (true, record.commissionBps, record.payoutWallet, sourceClass, scope, status);
    }

    // ============================================================= internals
    function _requireSource(bytes32 sourceId) internal view returns (SourceRecord storage record) {
        record = _sources[sourceId];
        if (record.sourceWallet == address(0)) revert UnknownSource();
    }

    function _isActive(SourceRecord memory record) internal view returns (bool) {
        if (record.sourceWallet == address(0)) return false;
        if (record.status != SourceStatus.ACTIVE) return false;
        if (record.startTime != 0 && block.timestamp < record.startTime) return false;
        if (record.endTime != 0 && block.timestamp > record.endTime) return false;
        return true;
    }

    function _validateTerms(SourceTerms calldata terms) internal pure {
        if (terms.sourceWallet == address(0) || terms.payoutWallet == address(0)) revert ZeroAddress();
        if (terms.commissionBps > MAX_COMMISSION_BPS) revert InvalidCommission();
        if (
            terms.sourceClass == SourceClass.MEMBER_INTRODUCTION &&
            terms.commissionBps > PUBLIC_AUTOMATIC_MAX_BPS
        ) {
            revert InvalidCommission();
        }
        if (terms.startTime != 0 && terms.endTime != 0 && terms.endTime <= terms.startTime) {
            revert InvalidWindow();
        }
        if (terms.scope == AttributionScope.FIRST_PURCHASE && terms.appliesToRepeatPurchases) {
            revert InvalidScope();
        }
        if (terms.scope == AttributionScope.WINDOWED && terms.endTime == 0) {
            revert InvalidWindow();
        }
        if (terms.scope == AttributionScope.CAPPED && terms.grossCap == 0 && terms.perBuyerCap == 0) {
            revert InvalidScope();
        }
        if (
            (
                terms.sourceClass != SourceClass.MEMBER_INTRODUCTION ||
                terms.commissionBps > MAX_MEMBER_INTRO_BPS ||
                terms.scope == AttributionScope.LIFETIME ||
                terms.scope == AttributionScope.CUSTOM
            ) &&
            terms.metadataHash == bytes32(0)
        ) {
            revert MissingMetadata();
        }
    }
}
