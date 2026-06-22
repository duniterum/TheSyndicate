// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {MembershipSaleV3} from "../src/MembershipSaleV3.sol";
import {SourceRegistryV1} from "../src/SourceRegistryV1.sol";

interface IERC20ForkLike {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

/// @title Deployed V3 source-attribution fork rehearsal
/// @notice REHEARSAL ONLY. Uses deployed Avalanche V3 addresses on a local fork.
///         No private keys, no broadcast, no mainnet source record, no registry switch.
contract SourceAttributionForkV3Test is Test {
    address constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address constant SYN = 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170;
    address constant VAULT = 0x205DdC8921A4C60106930eE35e1F395c8D13f464;
    address constant LIQUIDITY = 0xa9b072db8DcDbb470235204B69D37275d74a2e25;
    address constant OPERATIONS = 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80;
    address constant OWNER = 0x88EC79AF0d5A2F3b83022A1770c645506803Dd73;
    address constant SOURCE_REGISTRY = 0x780013bB358be6be95b401901264FC7c22a595a6;
    address constant MEMBERSHIP_SALE_V3 = 0x2A6cFc76906e758B934209AFf5A163c9bC20132E;

    bytes32 constant SOURCE_ID = keccak256("V3_FORK_REHEARSAL_BUILDER_SOURCE");
    bytes32 constant MEMBER_SOURCE_ID = keccak256("V3_FORK_REHEARSAL_MEMBER_SOURCE");
    bytes32 constant META = keccak256("v3-fork-rehearsal-source-packet");
    uint256 constant USDC_5 = 5_000_000;
    uint256 constant USDC_10 = 10_000_000;
    uint16 constant BUILDER_BPS = 500;

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

    event MembershipPurchasedV3(
        bytes32 indexed receiptId,
        address indexed buyer,
        address indexed recipient,
        uint256 memberNumber,
        uint256 grossUsdc,
        uint256 acquisitionCost,
        uint256 protocolContribution,
        uint256 vaultAmount,
        uint256 liquidityAmount,
        uint256 operationsAmount,
        uint256 synOut,
        uint64 synPerUsdc,
        uint16 era,
        uint16 chapter,
        bytes32 sourceId,
        uint8 sourceClass,
        address sourceWallet,
        uint16 commissionBps,
        uint8 attributionScope,
        uint256 attributionWindowEndsAt,
        uint256 sourceGrossRemaining,
        uint256 buyerGrossRemaining,
        bool firstSeat,
        uint8 receiptVersion
    );

    SourceRegistryV1 internal registry;
    MembershipSaleV3 internal sale;

    address internal sourceWallet = makeAddr("fork-source-wallet");
    address internal payoutWallet = makeAddr("fork-payout-wallet");
    address internal buyer = makeAddr("fork-source-buyer");
    address internal directBuyer = makeAddr("fork-direct-buyer");

    function setUp() public {
        string memory rpc = vm.envOr("AVAX_RPC", string(""));
        if (bytes(rpc).length == 0) {
            emit log("AVAX_RPC unset -> skipping deployed V3 source-attribution fork rehearsal");
            vm.skip(true);
            return;
        }

        uint256 forkBlock = vm.envOr("AVAX_FORK_BLOCK", uint256(88_525_814));
        vm.createSelectFork(rpc, forkBlock);

        registry = SourceRegistryV1(SOURCE_REGISTRY);
        sale = MembershipSaleV3(MEMBERSHIP_SALE_V3);
    }

    function _builderTerms(uint16 bps) internal view returns (SourceRegistryV1.SourceTerms memory terms) {
        terms = SourceRegistryV1.SourceTerms({
            sourceWallet: sourceWallet,
            sourceClass: SourceRegistryV1.SourceClass.BUILDER_SOURCE,
            commissionBps: bps,
            scope: SourceRegistryV1.AttributionScope.WINDOWED,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + 30 days),
            grossCap: 1_000e6,
            perBuyerCap: 25e6,
            appliesToRepeatPurchases: true,
            payoutWallet: payoutWallet,
            metadataHash: META
        });
    }

    function _memberTerms() internal view returns (SourceRegistryV1.SourceTerms memory terms) {
        terms = _builderTerms(BUILDER_BPS);
        terms.sourceClass = SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION;
        terms.metadataHash = bytes32(0);
    }

    function _fundAndApproveUsdc(address account, uint256 amount) internal {
        deal(USDC, account, amount);
        vm.prank(account);
        IERC20ForkLike(USDC).approve(address(sale), type(uint256).max);
    }

    function test_deployedV3Fork_sourceCreationAndSourceAttributedBuy() public {
        assertEq(block.chainid, 43_114, "Avalanche C-Chain fork");
        assertGt(SOURCE_REGISTRY.code.length, 0, "deployed SourceRegistryV1 exists");
        assertGt(MEMBERSHIP_SALE_V3.code.length, 0, "deployed MembershipSaleV3 exists");
        assertEq(registry.owner(), OWNER, "registry owner accepted");
        assertEq(sale.owner(), OWNER, "sale owner accepted");
        assertEq(address(sale.SOURCE_REGISTRY()), SOURCE_REGISTRY, "sale uses deployed source registry");
        assertEq(sale.memberCount(), 9, "member #9 exists at rehearsal fork block");
        assertFalse(registry.sourceExists(SOURCE_ID), "no rehearsal source exists before fork-only create");

        SourceRegistryV1.SourceTerms memory terms = _builderTerms(BUILDER_BPS);
        vm.expectEmit(true, true, true, true, address(registry));
        emit SourceCreated(
            SOURCE_ID,
            sourceWallet,
            uint8(SourceRegistryV1.SourceClass.BUILDER_SOURCE),
            BUILDER_BPS,
            uint8(SourceRegistryV1.SourceStatus.PAUSED),
            uint8(SourceRegistryV1.AttributionScope.WINDOWED),
            payoutWallet,
            META
        );
        vm.prank(OWNER);
        registry.createSource(SOURCE_ID, terms);
        vm.prank(OWNER);
        registry.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);

        SourceRegistryV1.SourceRecord memory record = registry.sourceConfig(SOURCE_ID);
        assertEq(record.sourceWallet, sourceWallet);
        assertEq(record.payoutWallet, payoutWallet);
        assertEq(record.commissionBps, BUILDER_BPS);
        assertEq(uint8(record.sourceClass), uint8(SourceRegistryV1.SourceClass.BUILDER_SOURCE));
        assertEq(uint8(record.scope), uint8(SourceRegistryV1.AttributionScope.WINDOWED));
        assertEq(uint8(record.status), uint8(SourceRegistryV1.SourceStatus.ACTIVE));
        assertTrue(record.appliesToRepeatPurchases);
        assertEq(record.grossCap, 1_000e6);
        assertEq(record.perBuyerCap, 25e6);

        uint256 payoutBefore = IERC20ForkLike(USDC).balanceOf(payoutWallet);
        uint256 vaultBefore = IERC20ForkLike(USDC).balanceOf(VAULT);
        uint256 liquidityBefore = IERC20ForkLike(USDC).balanceOf(LIQUIDITY);
        uint256 operationsBefore = IERC20ForkLike(USDC).balanceOf(OPERATIONS);
        uint256 receiptNumber = sale.receiptCount() + 1;
        bytes32 expectedReceiptId = keccak256(abi.encode(block.chainid, address(sale), receiptNumber));

        _fundAndApproveUsdc(buyer, USDC_5);
        vm.expectEmit(true, true, true, true, address(sale));
        emit MembershipPurchasedV3(
            expectedReceiptId,
            buyer,
            buyer,
            10,
            USDC_5,
            250_000,
            4_750_000,
            3_325_000,
            950_000,
            475_000,
            500 ether,
            100,
            1,
            1,
            SOURCE_ID,
            uint8(SourceRegistryV1.SourceClass.BUILDER_SOURCE),
            sourceWallet,
            BUILDER_BPS,
            uint8(SourceRegistryV1.AttributionScope.WINDOWED),
            record.endTime,
            record.grossCap - USDC_5,
            record.perBuyerCap - USDC_5,
            true,
            sale.RECEIPT_VERSION()
        );
        vm.prank(buyer);
        sale.buy(USDC_5, buyer, SOURCE_ID, 0, new bytes32[](0));

        assertEq(sale.memberNumberOf(buyer), 10, "source buyer becomes member #10 on fork");
        assertEq(sale.memberCount(), 10);
        assertEq(IERC20ForkLike(SYN).balanceOf(buyer), 500 ether);
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_5);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, buyer), USDC_5);
        assertEq(sale.buyerSourceId(buyer), SOURCE_ID);
        assertEq(IERC20ForkLike(USDC).balanceOf(payoutWallet) - payoutBefore, 250_000);
        assertEq(IERC20ForkLike(USDC).balanceOf(VAULT) - vaultBefore, 3_325_000);
        assertEq(IERC20ForkLike(USDC).balanceOf(LIQUIDITY) - liquidityBefore, 950_000);
        assertEq(IERC20ForkLike(USDC).balanceOf(OPERATIONS) - operationsBefore, 475_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);

        _fundAndApproveUsdc(directBuyer, USDC_5);
        uint256 sourceGrossBeforeDirect = sale.sourceGrossAttributed(SOURCE_ID);
        uint256 directPayoutBefore = IERC20ForkLike(USDC).balanceOf(payoutWallet);
        vm.prank(directBuyer);
        sale.buy(USDC_5, directBuyer, bytes32(0), 0, new bytes32[](0));

        assertEq(sale.memberNumberOf(directBuyer), 11, "zero-source buyer still receives next member number");
        assertEq(sale.buyerSourceId(directBuyer), bytes32(0), "direct buy has no source link");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), sourceGrossBeforeDirect, "zero-source buy does not accrue source gross");
        assertEq(IERC20ForkLike(USDC).balanceOf(payoutWallet), directPayoutBefore, "zero-source buy pays no source");
    }

    function test_deployedV3Fork_sourceGuardsPauseRevokeAndUnseatedMemberIntro() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms();
        vm.prank(OWNER);
        registry.createSource(MEMBER_SOURCE_ID, terms);
        vm.prank(OWNER);
        registry.setSourceStatus(MEMBER_SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);

        _fundAndApproveUsdc(buyer, USDC_5);
        vm.prank(buyer);
        vm.expectRevert(MembershipSaleV3.ReferrerNotSeated.selector);
        sale.buy(USDC_5, buyer, MEMBER_SOURCE_ID, 0, new bytes32[](0));

        deal(SYN, sourceWallet, 1 ether);

        vm.prank(OWNER);
        registry.setSourceStatus(MEMBER_SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        vm.prank(buyer);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_5, buyer, MEMBER_SOURCE_ID, 0, new bytes32[](0));

        vm.prank(OWNER);
        registry.setSourceStatus(MEMBER_SOURCE_ID, SourceRegistryV1.SourceStatus.REVOKED);
        vm.prank(buyer);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_5, buyer, MEMBER_SOURCE_ID, 0, new bytes32[](0));

        vm.expectRevert(SourceRegistryV1.InvalidCommission.selector);
        vm.prank(OWNER);
        registry.createSource(keccak256("V3_FORK_BAD_COMMISSION"), _builderTerms(3_001));

        SourceRegistryV1.SourceTerms memory badPayout = _builderTerms(BUILDER_BPS);
        badPayout.payoutWallet = address(0);
        vm.expectRevert(SourceRegistryV1.ZeroAddress.selector);
        vm.prank(OWNER);
        registry.createSource(keccak256("V3_FORK_ZERO_PAYOUT"), badPayout);
    }
}
