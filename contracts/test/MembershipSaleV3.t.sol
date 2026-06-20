// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {MembershipSaleV3} from "../src/MembershipSaleV3.sol";
import {SourceRegistryV1} from "../src/SourceRegistryV1.sol";
import {BlocklistERC20, MockERC20} from "./mocks/Tokens.sol";

contract PassivePayoutWallet {}

/// @title MembershipSaleV3 unit tests
/// @notice Covers the first acquisition-first V3 candidate before deployment review.
contract MembershipSaleV3Test is Test {
    BlocklistERC20 internal usdc;
    MockERC20 internal syn;
    SourceRegistryV1 internal sources;
    MembershipSaleV3 internal sale;

    address internal vault = makeAddr("vault");
    address internal liquidity = makeAddr("liquidity");
    address internal operations = makeAddr("operations");
    address internal sourceWallet = makeAddr("sourceWallet");
    address internal payoutWallet = makeAddr("payoutWallet");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    bytes32 internal constant SOURCE_ID = keccak256("MEMBER_INTRODUCTION");
    bytes32 internal constant META = keccak256("ipfs://v3-source-policy");

    uint256 internal constant GEN = 333;
    uint256 internal constant USDC_100 = 100_000_000;
    uint256 internal constant USDC_10 = 10_000_000;
    uint256 internal constant MAXTX = 1_000_000_000_000;
    uint256 internal constant FUND = 1e27;

    function setUp() public {
        usdc = new BlocklistERC20("USD Coin", "USDC", 6);
        syn = new MockERC20("Syndicate", "SYN", 18);
        sources = new SourceRegistryV1();
        sale = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps());
        syn.mint(address(sale), FUND);
        syn.mint(sourceWallet, 1 ether);
    }

    // ------------------------------------------------------------- builders
    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 5_000_000;
        for (uint256 i = 1; i < 9; ++i) a[i] = 1e15;
    }

    function _eraCaps() internal pure returns (uint256[9] memory c) {
        c[0] = 0;
        for (uint256 i = 1; i < 9; ++i) c[i] = 1e30;
    }

    function _deploy(
        uint256 genesisOffset,
        uint256[9] memory addrCaps,
        uint256 maxTx,
        uint256 reserve,
        uint256[9] memory eraCaps
    ) internal returns (MembershipSaleV3 s) {
        s = new MembershipSaleV3(
            address(usdc),
            address(syn),
            address(sources),
            vault,
            liquidity,
            operations,
            genesisOffset,
            bytes32(0),
            addrCaps,
            maxTx,
            reserve,
            eraCaps
        );
    }

    function _memberTerms(uint16 bps, uint256 perBuyerCap)
        internal
        view
        returns (SourceRegistryV1.SourceTerms memory terms)
    {
        terms = SourceRegistryV1.SourceTerms({
            sourceWallet: sourceWallet,
            sourceClass: SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION,
            commissionBps: bps,
            scope: SourceRegistryV1.AttributionScope.WINDOWED,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + 365 days),
            grossCap: 1_000_000e6,
            perBuyerCap: perBuyerCap,
            appliesToRepeatPurchases: true,
            payoutWallet: payoutWallet,
            metadataHash: META
        });
    }

    function _createSource(uint16 bps, uint256 perBuyerCap) internal {
        sources.createSource(SOURCE_ID, _memberTerms(bps, perBuyerCap));
    }

    function _approve(address buyer, uint256 amount) internal {
        usdc.mint(buyer, amount);
        vm.prank(buyer);
        usdc.approve(address(sale), type(uint256).max);
    }

    function _buy(address buyer, address recipient, uint256 gross, bytes32 sourceId) internal {
        vm.prank(buyer);
        sale.buy(gross, recipient, sourceId, 0, new bytes32[](0));
    }

    // ============================================================= no source
    function test_buy_noSource_routesGrossToProtocolAndIssuesSeat() public {
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "SYN priced on gross");
        assertEq(sale.memberCount(), GEN + 1);
        assertEq(sale.memberNumberOf(alice), GEN + 1);
        assertEq(sale.grossContributed(alice), USDC_100);
        assertEq(sale.totalGrossUsdc(), USDC_100);
        assertEq(sale.totalAcquisitionCost(), 0);
        assertEq(sale.totalProtocolContribution(), USDC_100);
        assertEq(usdc.balanceOf(vault), 70_000_000);
        assertEq(usdc.balanceOf(liquidity), 20_000_000);
        assertEq(usdc.balanceOf(operations), 10_000_000);
        assertEq(usdc.balanceOf(address(sale)), 0);
        assertEq(sale.receiptCount(), 1);
    }

    function test_buy_toRecipient_seatsRecipientNotPayer() public {
        _approve(alice, USDC_100);

        _buy(alice, bob, USDC_100, bytes32(0));

        assertEq(syn.balanceOf(alice), 0);
        assertEq(syn.balanceOf(bob), USDC_100 * 50 * 1e12);
        assertEq(sale.memberNumberOf(bob), GEN + 1);
        assertEq(sale.memberNumberOf(alice), 0);
        assertTrue(sale.knownMember(bob));
    }

    // ====================================================== acquisition-first
    function test_buy_source_acquisitionFirstRoutesNetAndPaysSource() public {
        _createSource(1_500, 10_000e6);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(usdc.balanceOf(payoutWallet), 15_000_000, "15% acquisition cost");
        assertEq(usdc.balanceOf(vault), 59_500_000, "70% of net contribution");
        assertEq(usdc.balanceOf(liquidity), 17_000_000, "20% of net contribution");
        assertEq(usdc.balanceOf(operations), 8_500_000, "10% of net contribution");
        assertEq(usdc.balanceOf(payoutWallet) + usdc.balanceOf(vault) + usdc.balanceOf(liquidity) + usdc.balanceOf(operations), USDC_100);
        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "SYN remains priced on gross");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100);
        assertEq(sale.buyerSourceId(alice), SOURCE_ID);
        assertEq(sale.totalAcquisitionCost(), 15_000_000);
        assertEq(sale.totalProtocolContribution(), 85_000_000);
    }

    function test_buy_smartContractPayoutWalletWorksWithoutEscrow() public {
        PassivePayoutWallet contractWallet = new PassivePayoutWallet();
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_500, 10_000e6);
        terms.payoutWallet = address(contractWallet);
        sources.createSource(SOURCE_ID, terms);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(usdc.balanceOf(address(contractWallet)), 15_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function test_buy_blockedPayoutEscrowsAcquisitionWithoutBlockingPurchase() public {
        _createSource(1_500, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "seat still receives SYN");
        assertEq(sale.memberCount(), GEN + 1, "buy still seats recipient");
        assertEq(usdc.balanceOf(payoutWallet), 0, "blocked payout not delivered");
        assertEq(usdc.balanceOf(vault), 59_500_000);
        assertEq(usdc.balanceOf(liquidity), 17_000_000);
        assertEq(usdc.balanceOf(operations), 8_500_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 15_000_000);
        assertEq(sale.totalAcquisitionEscrowed(), 15_000_000);
        assertEq(usdc.balanceOf(address(sale)), sale.totalAcquisitionEscrowed(), "escrow stays conserved");
        assertEq(sale.totalAcquisitionCost(), 15_000_000, "receipt accounting still records acquisition cost");
        assertEq(sale.totalProtocolContribution(), 85_000_000);
    }

    function test_claimSourceEscrow_usesUpdatedRegistryPayoutWallet() public {
        _createSource(1_500, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);
        _buy(alice, alice, USDC_100, SOURCE_ID);

        address recoveredPayout = makeAddr("recoveredPayout");
        sources.updatePayoutWallet(SOURCE_ID, recoveredPayout);

        sale.claimSourceEscrow(SOURCE_ID);

        assertEq(usdc.balanceOf(recoveredPayout), 15_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function test_claimSourceEscrow_revertsWhenNothingOwed() public {
        vm.expectRevert(MembershipSaleV3.NothingToClaim.selector);
        sale.claimSourceEscrow(SOURCE_ID);
    }

    function test_buy_repeatPurchaseUsesLinkedSourceUntilCap() public {
        _createSource(1_500, 200e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(sale.memberCount(), GEN + 1, "repeat does not mint second seat");
        assertEq(usdc.balanceOf(payoutWallet), 30_000_000, "linked source paid on repeat inside cap");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100 * 2);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100 * 2);
    }

    function test_buy_linkedSourceCapStopsCommissionButNotPurchase() public {
        _createSource(1_500, 100e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 15_000_000, "second buy pays no capped commission");
        assertEq(usdc.balanceOf(vault), 70_000_000 + 59_500_000, "second buy routes full gross protocol split");
        assertEq(sale.totalGrossUsdc(), USDC_100 * 2);
        assertEq(sale.totalAcquisitionCost(), 15_000_000);
        assertEq(sale.totalProtocolContribution(), 185_000_000);
        assertEq(sale.receiptCount(), 2);
    }

    function test_buy_explicitCappedSourceReverts() public {
        _createSource(1_500, 100e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_selfReferralReverts() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500, 10_000e6);
        terms.sourceWallet = alice;
        terms.payoutWallet = alice;
        sources.createSource(SOURCE_ID, terms);
        syn.mint(alice, 1 ether);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SelfReferral.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_unseatedPublicReferrerExplicitSourceReverts() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500, 10_000e6);
        address unseated = makeAddr("unseated");
        terms.sourceWallet = unseated;
        sources.createSource(SOURCE_ID, terms);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.ReferrerNotSeated.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_pausedSourceExplicitSourceReverts() public {
        _createSource(500, 10_000e6);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    // ================================================================ views
    function test_quote_reportsAcquisitionFirstAmounts() public {
        _createSource(1_500, 10_000e6);

        (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 acquisitionCost,
            uint256 protocolContribution
        ) = sale.quote(USDC_100, alice, SOURCE_ID);

        assertEq(synOut, USDC_100 * 50 * 1e12);
        assertEq(era, 2);
        assertEq(synPerUsdc, 50);
        assertEq(seatIfFirst, GEN + 1);
        assertEq(acquisitionCost, 15_000_000);
        assertEq(protocolContribution, 85_000_000);
    }
}
