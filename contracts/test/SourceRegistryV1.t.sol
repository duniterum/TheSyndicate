// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {SourceRegistryV1} from "../src/SourceRegistryV1.sol";

/// @title SourceRegistryV1 unit tests
/// @notice Covers V3 source-policy terms before MembershipSaleV3 consumes them.
contract SourceRegistryV1Test is Test {
    SourceRegistryV1 internal registry;

    address internal sourceWallet = makeAddr("sourceWallet");
    address internal newSourceWallet = makeAddr("newSourceWallet");
    address internal payoutWallet = makeAddr("payoutWallet");
    address internal newPayoutWallet = makeAddr("newPayoutWallet");
    address internal notOwner = makeAddr("notOwner");

    bytes32 internal constant SOURCE_ID = keccak256("MEMBER_SOURCE");
    bytes32 internal constant BUILDER_ID = keccak256("BUILDER_SOURCE");
    bytes32 internal constant META = keccak256("ipfs://source-policy");

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

    function setUp() public {
        registry = new SourceRegistryV1();
    }

    // ---------------------------------------------------------------- helpers
    function _memberTerms(uint16 bps) internal view returns (SourceRegistryV1.SourceTerms memory terms) {
        terms = SourceRegistryV1.SourceTerms({
            sourceWallet: sourceWallet,
            sourceClass: SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION,
            commissionBps: bps,
            scope: SourceRegistryV1.AttributionScope.WINDOWED,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + 365 days),
            grossCap: 100_000e6,
            perBuyerCap: 10_000e6,
            appliesToRepeatPurchases: true,
            payoutWallet: payoutWallet,
            metadataHash: META
        });
    }

    function _builderTerms(uint16 bps) internal view returns (SourceRegistryV1.SourceTerms memory terms) {
        terms = SourceRegistryV1.SourceTerms({
            sourceWallet: sourceWallet,
            sourceClass: SourceRegistryV1.SourceClass.BUILDER_SOURCE,
            commissionBps: bps,
            scope: SourceRegistryV1.AttributionScope.CAPPED,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + 180 days),
            grossCap: 1_000_000e6,
            perBuyerCap: 50_000e6,
            appliesToRepeatPurchases: true,
            payoutWallet: payoutWallet,
            metadataHash: META
        });
    }

    function _createMemberSource(uint16 bps) internal {
        registry.createSource(SOURCE_ID, _memberTerms(bps));
    }

    // ============================================================= constants
    function test_constants_freezeV3Caps() public view {
        assertEq(registry.BPS_DENOMINATOR(), 10_000);
        assertEq(registry.MAX_COMMISSION_BPS(), 3_000);
        assertEq(registry.MAX_MEMBER_INTRO_BPS(), 1_200);
        assertEq(registry.PUBLIC_AUTOMATIC_MAX_BPS(), 1_200);
    }

    // ============================================================= creation
    function test_createSource_storesAndEmitsTerms() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_200);

        vm.expectEmit(true, true, true, true);
        emit SourceCreated(
            SOURCE_ID,
            sourceWallet,
            uint8(SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION),
            1_200,
            uint8(SourceRegistryV1.SourceStatus.ACTIVE),
            uint8(SourceRegistryV1.AttributionScope.WINDOWED),
            payoutWallet,
            META
        );
        registry.createSource(SOURCE_ID, terms);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.sourceWallet, sourceWallet);
        assertEq(uint8(record.sourceClass), uint8(SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION));
        assertEq(record.commissionBps, 1_200);
        assertEq(uint8(record.status), uint8(SourceRegistryV1.SourceStatus.ACTIVE));
        assertEq(uint8(record.scope), uint8(SourceRegistryV1.AttributionScope.WINDOWED));
        assertEq(record.grossCap, 100_000e6);
        assertEq(record.perBuyerCap, 10_000e6);
        assertTrue(record.appliesToRepeatPurchases);
        assertEq(record.payoutWallet, payoutWallet);
        assertEq(record.metadataHash, META);
        assertEq(record.createdBy, address(this));
        assertEq(record.updatedAt, uint64(block.timestamp));
        assertTrue(registry.sourceExists(SOURCE_ID));
        assertTrue(registry.isActive(SOURCE_ID));
    }

    function test_createSource_onlyOwner() public {
        vm.prank(notOwner);
        vm.expectRevert();
        registry.createSource(SOURCE_ID, _memberTerms(500));
    }

    function test_createSource_rejectsZeroSourceIdAndDuplicate() public {
        vm.expectRevert(SourceRegistryV1.ZeroSourceId.selector);
        registry.createSource(bytes32(0), _memberTerms(500));

        _createMemberSource(500);
        vm.expectRevert(SourceRegistryV1.SourceExists.selector);
        registry.createSource(SOURCE_ID, _memberTerms(500));
    }

    function test_createSource_rejectsZeroWallets() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500);
        terms.sourceWallet = address(0);
        vm.expectRevert(SourceRegistryV1.ZeroAddress.selector);
        registry.createSource(SOURCE_ID, terms);

        terms = _memberTerms(500);
        terms.payoutWallet = address(0);
        vm.expectRevert(SourceRegistryV1.ZeroAddress.selector);
        registry.createSource(SOURCE_ID, terms);
    }

    function test_createSource_enforcesCommissionCaps() public {
        registry.createSource(SOURCE_ID, _memberTerms(1_200));
        SourceRegistryV1.SourceRecord memory memberRecord = registry.sourceConfig(SOURCE_ID);
        assertEq(memberRecord.commissionBps, 1_200);

        vm.expectRevert(SourceRegistryV1.InvalidCommission.selector);
        registry.createSource(keccak256("MEMBER_OVER_PUBLIC_CAP"), _memberTerms(1_201));

        vm.expectRevert(SourceRegistryV1.InvalidCommission.selector);
        registry.createSource(BUILDER_ID, _builderTerms(3_001));

        registry.createSource(BUILDER_ID, _builderTerms(3_000));
        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(BUILDER_ID);
        assertEq(record.commissionBps, 3_000);
    }

    function test_createSource_requiresMetadataForReviewedOrHighRateTerms() public {
        SourceRegistryV1.SourceTerms memory terms = _builderTerms(2_000);
        terms.metadataHash = bytes32(0);
        vm.expectRevert(SourceRegistryV1.MissingMetadata.selector);
        registry.createSource(BUILDER_ID, terms);

        terms = _memberTerms(500);
        terms.scope = SourceRegistryV1.AttributionScope.LIFETIME;
        terms.metadataHash = bytes32(0);
        vm.expectRevert(SourceRegistryV1.MissingMetadata.selector);
        registry.createSource(SOURCE_ID, terms);
    }

    function test_createSource_validatesScopeRules() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500);
        terms.scope = SourceRegistryV1.AttributionScope.FIRST_PURCHASE;
        terms.appliesToRepeatPurchases = true;
        vm.expectRevert(SourceRegistryV1.InvalidScope.selector);
        registry.createSource(SOURCE_ID, terms);

        terms = _memberTerms(500);
        terms.scope = SourceRegistryV1.AttributionScope.WINDOWED;
        terms.endTime = 0;
        vm.expectRevert(SourceRegistryV1.InvalidWindow.selector);
        registry.createSource(SOURCE_ID, terms);

        terms = _memberTerms(500);
        terms.scope = SourceRegistryV1.AttributionScope.CAPPED;
        terms.grossCap = 0;
        terms.perBuyerCap = 0;
        vm.expectRevert(SourceRegistryV1.InvalidScope.selector);
        registry.createSource(SOURCE_ID, terms);

        terms = _memberTerms(500);
        terms.scope = SourceRegistryV1.AttributionScope.CUSTOM;
        terms.metadataHash = bytes32(0);
        vm.expectRevert(SourceRegistryV1.MissingMetadata.selector);
        registry.createSource(SOURCE_ID, terms);
    }

    function test_createSource_validatesWindowOrder() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500);
        terms.endTime = terms.startTime;
        vm.expectRevert(SourceRegistryV1.InvalidWindow.selector);
        registry.createSource(SOURCE_ID, terms);
    }

    // ================================================================ updates
    function test_updateSourceTerms_storesAndEmits() public {
        _createMemberSource(500);

        SourceRegistryV1.SourceTerms memory terms = _builderTerms(2_000);
        vm.expectEmit(true, true, true, true);
        emit SourceTermsUpdated(
            SOURCE_ID,
            sourceWallet,
            uint8(SourceRegistryV1.SourceClass.BUILDER_SOURCE),
            2_000,
            uint8(SourceRegistryV1.AttributionScope.CAPPED),
            terms.startTime,
            terms.endTime,
            terms.grossCap,
            terms.perBuyerCap,
            true,
            payoutWallet,
            META
        );
        registry.updateSourceTerms(SOURCE_ID, terms);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(uint8(record.sourceClass), uint8(SourceRegistryV1.SourceClass.BUILDER_SOURCE));
        assertEq(record.commissionBps, 2_000);
        assertEq(uint8(record.scope), uint8(SourceRegistryV1.AttributionScope.CAPPED));
        assertEq(record.createdBy, address(this), "creator preserved");
        assertEq(record.updatedAt, uint64(block.timestamp));
    }

    function test_updateSourceTerms_cannotSilentlyChangeSourceWallet() public {
        _createMemberSource(500);

        SourceRegistryV1.SourceTerms memory terms = _builderTerms(2_000);
        terms.sourceWallet = newSourceWallet;

        vm.expectRevert(SourceRegistryV1.SourceWalletMismatch.selector);
        registry.updateSourceTerms(SOURCE_ID, terms);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.sourceWallet, sourceWallet);
    }

    function test_updateSourceTerms_cannotSilentlyChangePayoutWallet() public {
        _createMemberSource(500);

        SourceRegistryV1.SourceTerms memory terms = _memberTerms(800);
        terms.payoutWallet = newPayoutWallet;

        vm.expectRevert(SourceRegistryV1.PayoutWalletChangeRequiresRecovery.selector);
        registry.updateSourceTerms(SOURCE_ID, terms);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.payoutWallet, payoutWallet);
    }

    function test_updateSourceTerms_unknownReverts() public {
        vm.expectRevert(SourceRegistryV1.UnknownSource.selector);
        registry.updateSourceTerms(SOURCE_ID, _memberTerms(500));
    }

    function test_setSourceStatus_sourceWalletAndPayoutWalletEmitVisiblePolicyActions() public {
        _createMemberSource(500);

        vm.expectEmit(true, false, false, true);
        emit SourceStatusChanged(
            SOURCE_ID,
            uint8(SourceRegistryV1.SourceStatus.ACTIVE),
            uint8(SourceRegistryV1.SourceStatus.PAUSED)
        );
        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(uint8(record.status), uint8(SourceRegistryV1.SourceStatus.PAUSED));
        assertFalse(registry.isActive(SOURCE_ID));

        vm.expectEmit(true, false, false, true);
        emit SourceWalletUpdated(SOURCE_ID, sourceWallet, newSourceWallet);
        registry.updateSourceWallet(SOURCE_ID, newSourceWallet);
        record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.sourceWallet, newSourceWallet);
        assertEq(uint8(record.status), uint8(SourceRegistryV1.SourceStatus.PAUSED), "recovery keeps review pause");

        vm.expectEmit(true, false, false, true);
        emit SourcePayoutWalletUpdated(SOURCE_ID, payoutWallet, newPayoutWallet);
        registry.updatePayoutWallet(SOURCE_ID, newPayoutWallet);
        record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.payoutWallet, newPayoutWallet);
    }

    function test_setSourceStatus_rejectsNoneAndUnknown() public {
        vm.expectRevert(SourceRegistryV1.InvalidStatus.selector);
        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.NONE);

        vm.expectRevert(SourceRegistryV1.UnknownSource.selector);
        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
    }

    function test_updateSourceWallet_rejectsZeroAndUnknown() public {
        _createMemberSource(500);

        vm.expectRevert(SourceRegistryV1.ZeroAddress.selector);
        registry.updateSourceWallet(SOURCE_ID, address(0));

        vm.expectRevert(SourceRegistryV1.UnknownSource.selector);
        registry.updateSourceWallet(BUILDER_ID, newSourceWallet);
    }

    function test_updatePayoutWallet_rejectsZeroAndUnknown() public {
        _createMemberSource(500);

        vm.expectRevert(SourceRegistryV1.ZeroAddress.selector);
        registry.updatePayoutWallet(SOURCE_ID, address(0));

        vm.expectRevert(SourceRegistryV1.UnknownSource.selector);
        registry.updatePayoutWallet(BUILDER_ID, newPayoutWallet);
    }

    // ===================================================== attribution helper
    function test_attributionTerms_unknownReturnsIneligible() public view {
        (
            bool eligible,
            uint16 bps,
            address payout,
            SourceRegistryV1.SourceClass sourceClass,
            SourceRegistryV1.AttributionScope scope,
            SourceRegistryV1.SourceStatus status
        ) = registry.attributionTerms(SOURCE_ID, 0, 0);

        assertFalse(eligible);
        assertEq(bps, 0);
        assertEq(payout, address(0));
        assertEq(uint8(sourceClass), uint8(SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION));
        assertEq(uint8(scope), uint8(SourceRegistryV1.AttributionScope.FIRST_PURCHASE));
        assertEq(uint8(status), uint8(SourceRegistryV1.SourceStatus.NONE));
    }

    function test_attributionTerms_activeInsideWindowAndCaps() public {
        _createMemberSource(1_200);

        (
            bool eligible,
            uint16 bps,
            address payout,
            SourceRegistryV1.SourceClass sourceClass,
            SourceRegistryV1.AttributionScope scope,
            SourceRegistryV1.SourceStatus status
        ) = registry.attributionTerms(SOURCE_ID, 99_999e6, 9_999e6);

        assertTrue(eligible);
        assertEq(bps, 1_200);
        assertEq(payout, payoutWallet);
        assertEq(uint8(sourceClass), uint8(SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION));
        assertEq(uint8(scope), uint8(SourceRegistryV1.AttributionScope.WINDOWED));
        assertEq(uint8(status), uint8(SourceRegistryV1.SourceStatus.ACTIVE));
    }

    function test_attributionTerms_rejectsPausedRevokedFutureExpiredAndCaps() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_200);
        terms.startTime = uint64(block.timestamp + 1 days);
        terms.endTime = uint64(block.timestamp + 2 days);
        registry.createSource(SOURCE_ID, terms);

        (bool eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 1, 1);
        assertFalse(eligible, "not active before start");

        vm.warp(block.timestamp + 1 days);
        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 100_001e6, 1);
        assertFalse(eligible, "source gross cap reached");

        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 1, 10_001e6);
        assertFalse(eligible, "buyer gross cap reached");

        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 100e6, 100e6);
        assertTrue(eligible, "inside window and caps");

        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 100e6, 100e6);
        assertFalse(eligible, "paused");

        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        vm.warp(block.timestamp + 2 days);
        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 100e6, 100e6);
        assertFalse(eligible, "expired");

        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.REVOKED);
        (eligible,,,,,) = registry.attributionTerms(SOURCE_ID, 100e6, 100e6);
        assertFalse(eligible, "revoked");
    }
}
