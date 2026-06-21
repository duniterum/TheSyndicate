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

    function _deployWithRoot(bytes32 root) internal returns (MembershipSaleV3 s) {
        s = new MembershipSaleV3(
            address(usdc),
            address(syn),
            address(sources),
            vault,
            liquidity,
            operations,
            GEN,
            root,
            _addrCaps(),
            MAXTX,
            0,
            _eraCaps()
        );
    }

    function _historicalLeaf(address who, uint256 memberNumber) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(who, memberNumber))));
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(bytes.concat(a, b)) : keccak256(bytes.concat(b, a));
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
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
    }

    function _createSource(SourceRegistryV1.SourceTerms memory terms) internal {
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
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

    function _assertUsdcConservation(uint256 expectedGross) internal view {
        uint256 routed = usdc.balanceOf(payoutWallet)
            + usdc.balanceOf(vault)
            + usdc.balanceOf(liquidity)
            + usdc.balanceOf(operations)
            + usdc.balanceOf(address(sale));
        assertEq(routed, expectedGross, "all USDC is paid or escrowed");
        assertEq(usdc.balanceOf(address(sale)), sale.totalAcquisitionEscrowed(), "sale only holds escrowed acquisition");
    }

    function test_constructor_rejectsDuplicateRouteWallets() public {
        vm.expectRevert(MembershipSaleV3.DuplicateRouteWallet.selector);
        new MembershipSaleV3(
            address(usdc),
            address(syn),
            address(sources),
            vault,
            vault,
            operations,
            GEN,
            bytes32(0),
            _addrCaps(),
            MAXTX,
            0,
            _eraCaps()
        );
    }

    // ============================================================= no source
    function test_buy_noSource_routesGrossToProtocolAndIssuesSeat() public {
        assertEq(syn.balanceOf(alice), 0, "unknown zero-SYN wallet starts unseated");
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "SYN priced on gross");
        assertEq(sale.memberCount(), GEN + 1);
        assertEq(sale.memberNumberOf(alice), GEN + 1);
        assertGt(sale.memberNumberOf(alice), 0, "V3 never emits or stores memberNumber zero");
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

    function test_buy_addressOnlyHistoricalProofRevertsWithoutPartialState() public {
        bytes32 aliceLeaf = keccak256(bytes.concat(keccak256(abi.encode(alice))));
        bytes32 bobLeaf = keccak256(bytes.concat(keccak256(abi.encode(bob))));
        sale = _deployWithRoot(_hashPair(aliceLeaf, bobLeaf));
        syn.mint(address(sale), FUND);
        _approve(alice, USDC_100);
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bobLeaf;

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.InvalidProof.selector);
        sale.buy(USDC_100, alice, bytes32(0), 0, proof);

        assertEq(sale.memberNumberOf(alice), 0);
        assertFalse(sale.knownMember(alice), "obsolete proof does not leave partial state");
        assertEq(sale.receiptCount(), 0);
    }

    function test_claimV1Membership_addressOnlyPathDisabled() public {
        bytes32 aliceLeaf = keccak256(bytes.concat(keccak256(abi.encode(alice))));
        bytes32 bobLeaf = keccak256(bytes.concat(keccak256(abi.encode(bob))));
        sale = _deployWithRoot(_hashPair(aliceLeaf, bobLeaf));
        syn.mint(address(sale), FUND);
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bobLeaf;

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.InvalidProof.selector);
        sale.claimV1Membership(proof);

        assertFalse(sale.knownMember(alice));
        assertEq(sale.memberNumberOf(alice), 0);
        assertEq(sale.receiptCount(), 0);
    }

    function test_claimHistoricalMembership_setsKnownMemberAndNumber() public {
        uint256 historicalNumber = 42;
        bytes32 aliceLeaf = _historicalLeaf(alice, historicalNumber);
        bytes32 bobLeaf = _historicalLeaf(bob, 43);
        sale = _deployWithRoot(_hashPair(aliceLeaf, bobLeaf));
        syn.mint(address(sale), FUND);
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bobLeaf;

        vm.prank(alice);
        sale.claimHistoricalMembership(historicalNumber, proof);

        assertTrue(sale.knownMember(alice));
        assertEq(sale.memberNumberOf(alice), historicalNumber);
        assertEq(sale.memberByNumber(historicalNumber), alice);
        assertEq(sale.memberCount(), GEN, "historical recognition does not create a new seat");
    }

    function test_buy_existingSynHolderWithHistoricalProofCanBuyWithoutFirstSeat() public {
        uint256 historicalNumber = 42;
        bytes32 aliceLeaf = _historicalLeaf(alice, historicalNumber);
        bytes32 bobLeaf = _historicalLeaf(bob, 43);
        sale = _deployWithRoot(_hashPair(aliceLeaf, bobLeaf));
        syn.mint(address(sale), FUND);
        syn.mint(alice, 1 ether);
        _approve(alice, USDC_100);
        bytes32[] memory proof = new bytes32[](1);
        proof[0] = bobLeaf;

        vm.prank(alice);
        sale.claimHistoricalMembership(historicalNumber, proof);

        bytes32 expectedReceiptId = keccak256(abi.encode(block.chainid, address(sale), uint256(1)));
        vm.expectEmit(true, true, true, true, address(sale));
        emit MembershipPurchasedV3(
            expectedReceiptId,
            alice,
            alice,
            historicalNumber,
            USDC_100,
            0,
            USDC_100,
            70_000_000,
            20_000_000,
            10_000_000,
            USDC_100 * 50 * 1e12,
            50,
            2,
            1,
            bytes32(0),
            0,
            address(0),
            0,
            0,
            0,
            0,
            0,
            false,
            sale.RECEIPT_VERSION()
        );
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(sale.memberNumberOf(alice), historicalNumber);
        assertEq(sale.memberCount(), GEN, "historical member does not increment V3 seat count");
        assertEq(sale.receiptCount(), 1);
    }

    function test_claimHistoricalMembership_rejectsZeroDuplicateAndChangedNumber() public {
        bytes32 aliceLeaf = _historicalLeaf(alice, 42);
        bytes32 bobLeaf = _historicalLeaf(bob, 42);
        sale = _deployWithRoot(_hashPair(aliceLeaf, bobLeaf));
        syn.mint(address(sale), FUND);
        bytes32[] memory aliceProof = new bytes32[](1);
        aliceProof[0] = bobLeaf;
        bytes32[] memory bobProof = new bytes32[](1);
        bobProof[0] = aliceLeaf;

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MembershipSaleV3.InvalidHistoricalMemberNumber.selector, 0));
        sale.claimHistoricalMembership(0, aliceProof);

        vm.prank(alice);
        sale.claimHistoricalMembership(42, aliceProof);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.AlreadyKnown.selector);
        sale.claimHistoricalMembership(43, aliceProof);

        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(MembershipSaleV3.HistoricalMemberNumberTaken.selector, 42));
        sale.claimHistoricalMembership(42, bobProof);
    }

    function test_buy_unknownSynHolderReceivesNewV3MemberNumber() public {
        syn.mint(alice, 1 ether);
        _approve(alice, USDC_100);

        bytes32 expectedReceiptId = keccak256(abi.encode(block.chainid, address(sale), uint256(1)));
        vm.expectEmit(true, true, true, true, address(sale));
        emit MembershipPurchasedV3(
            expectedReceiptId,
            alice,
            alice,
            GEN + 1,
            USDC_100,
            0,
            USDC_100,
            70_000_000,
            20_000_000,
            10_000_000,
            USDC_100 * 50 * 1e12,
            50,
            2,
            2,
            bytes32(0),
            0,
            address(0),
            0,
            0,
            0,
            0,
            0,
            true,
            sale.RECEIPT_VERSION()
        );
        vm.prank(alice);
        sale.buy(USDC_100, alice, bytes32(0), 0, new bytes32[](0));

        assertTrue(sale.knownMember(alice));
        assertEq(sale.memberNumberOf(alice), GEN + 1);
        assertEq(sale.memberByNumber(GEN + 1), alice);
        assertEq(sale.memberCount(), GEN + 1);
        assertEq(sale.receiptCount(), 1);
    }

    function test_quote_unknownSynDustHolderDoesNotRevert() public {
        syn.mint(alice, 1);

        (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 acquisitionCost,
            uint256 protocolContribution
        ) = sale.quote(USDC_100, alice, bytes32(0));

        assertEq(synOut, USDC_100 * 50 * 1e12);
        assertEq(era, 2);
        assertEq(synPerUsdc, 50);
        assertEq(seatIfFirst, GEN + 1);
        assertEq(acquisitionCost, 0);
        assertEq(protocolContribution, USDC_100);
    }

    function test_buy_corruptedKnownMemberWithZeroMemberNumberStillReverts() public {
        bytes32 knownMemberSlot = keccak256(abi.encode(alice, uint256(14)));
        vm.store(address(sale), knownMemberSlot, bytes32(uint256(1)));
        assertTrue(sale.knownMember(alice));
        assertEq(sale.memberNumberOf(alice), 0);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MembershipSaleV3.UnknownHistoricalMemberNumber.selector, alice));
        sale.buy(USDC_100, alice, bytes32(0), 0, new bytes32[](0));
    }

    function test_buy_repeatBuyerKeepsExistingNonzeroMemberNumber() public {
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, bytes32(0));
        uint256 memberNumber = sale.memberNumberOf(alice);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(memberNumber, GEN + 1);
        assertEq(sale.memberNumberOf(alice), memberNumber);
        assertEq(sale.memberCount(), GEN + 1);
        assertEq(sale.receiptCount(), 2);
    }

    // ====================================================== acquisition-first
    function test_buy_source_acquisitionFirstRoutesNetAndPaysSource() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "12% acquisition cost");
        assertEq(usdc.balanceOf(vault), 61_600_000, "70% of net contribution");
        assertEq(usdc.balanceOf(liquidity), 17_600_000, "20% of net contribution");
        assertEq(usdc.balanceOf(operations), 8_800_000, "10% of net contribution");
        assertEq(usdc.balanceOf(payoutWallet) + usdc.balanceOf(vault) + usdc.balanceOf(liquidity) + usdc.balanceOf(operations), USDC_100);
        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "SYN remains priced on gross");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100);
        assertEq(sale.buyerSourceId(alice), SOURCE_ID);
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.totalProtocolContribution(), 88_000_000);
    }

    function test_buy_receiptEventReconstructsPurchase() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100);
        bytes32 expectedReceiptId = keccak256(abi.encode(block.chainid, address(sale), uint256(1)));

        vm.expectEmit(true, true, true, true, address(sale));
        emit MembershipPurchasedV3(
            expectedReceiptId,
            alice,
            alice,
            GEN + 1,
            USDC_100,
            12_000_000,
            88_000_000,
            61_600_000,
            17_600_000,
            8_800_000,
            USDC_100 * 50 * 1e12,
            50,
            2,
            2,
            SOURCE_ID,
            uint8(SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION),
            sourceWallet,
            1_200,
            uint8(SourceRegistryV1.AttributionScope.WINDOWED),
            block.timestamp + 365 days,
            999_900e6,
            9_900e6,
            true,
            sale.RECEIPT_VERSION()
        );

        _buy(alice, alice, USDC_100, SOURCE_ID);
    }

    function test_buy_sourceGrossCapBoundaryAllowsExactCapThenStopsAutoCommission() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_200, 0);
        terms.grossCap = USDC_100;
        terms.perBuyerCap = 0;
        _createSource(terms);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "cap boundary pays once");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100, "capped auto source does not keep accruing");
        assertEq(sale.totalGrossUsdc(), USDC_100 * 2);
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        _assertUsdcConservation(USDC_100 * 2);
    }

    function testFuzz_acquisitionFirstConservationAndRounding(uint96 rawGross, uint16 rawBps) public {
        uint256 gross = bound(uint256(rawGross), USDC_10, MAXTX);
        uint16 bps = uint16(bound(uint256(rawBps), 0, 3_000));
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(bps, type(uint256).max);
        if (bps > sources.MAX_MEMBER_INTRO_BPS()) {
            terms.sourceClass = SourceRegistryV1.SourceClass.BUILDER_SOURCE;
        }
        terms.grossCap = type(uint256).max;
        terms.perBuyerCap = type(uint256).max;
        _createSource(terms);
        _approve(alice, gross);

        _buy(alice, alice, gross, SOURCE_ID);

        uint256 acquisitionCost = (gross * bps) / 10_000;
        uint256 protocolContribution = gross - acquisitionCost;
        uint256 vaultAmount = (protocolContribution * 70) / 100;
        uint256 liquidityAmount = (protocolContribution * 20) / 100;
        uint256 operationsAmount = protocolContribution - vaultAmount - liquidityAmount;

        assertEq(acquisitionCost + vaultAmount + liquidityAmount + operationsAmount, gross, "rounding conserved");
        assertEq(usdc.balanceOf(payoutWallet), acquisitionCost);
        assertEq(usdc.balanceOf(vault), vaultAmount);
        assertEq(usdc.balanceOf(liquidity), liquidityAmount);
        assertEq(usdc.balanceOf(operations), operationsAmount);
        assertEq(sale.totalGrossUsdc(), gross);
        assertEq(sale.totalAcquisitionCost(), acquisitionCost);
        assertEq(sale.totalProtocolContribution(), protocolContribution);
        _assertUsdcConservation(gross);
    }

    function test_buy_smartContractPayoutWalletWorksWithoutEscrow() public {
        PassivePayoutWallet contractWallet = new PassivePayoutWallet();
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_200, 10_000e6);
        terms.payoutWallet = address(contractWallet);
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(usdc.balanceOf(address(contractWallet)), 12_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function test_buy_blockedPayoutEscrowsAcquisitionWithoutBlockingPurchase() public {
        _createSource(1_200, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        assertEq(syn.balanceOf(alice), USDC_100 * 50 * 1e12, "seat still receives SYN");
        assertEq(sale.memberCount(), GEN + 1, "buy still seats recipient");
        assertEq(usdc.balanceOf(payoutWallet), 0, "blocked payout not delivered");
        assertEq(usdc.balanceOf(vault), 61_600_000);
        assertEq(usdc.balanceOf(liquidity), 17_600_000);
        assertEq(usdc.balanceOf(operations), 8_800_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 12_000_000);
        assertEq(sale.totalAcquisitionEscrowed(), 12_000_000);
        assertEq(usdc.balanceOf(address(sale)), sale.totalAcquisitionEscrowed(), "escrow stays conserved");
        assertEq(sale.totalAcquisitionCost(), 12_000_000, "receipt accounting still records acquisition cost");
        assertEq(sale.totalProtocolContribution(), 88_000_000);
    }

    function test_claimSourceEscrow_usesUpdatedRegistryPayoutWallet() public {
        _createSource(1_200, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);
        _buy(alice, alice, USDC_100, SOURCE_ID);

        address recoveredPayout = makeAddr("recoveredPayout");
        sources.updatePayoutWallet(SOURCE_ID, recoveredPayout);

        sale.claimSourceEscrow(SOURCE_ID);

        assertEq(usdc.balanceOf(recoveredPayout), 12_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function test_claimSourceEscrow_revertsWhileSourcePausedOrRevoked() public {
        _createSource(1_200, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);
        _buy(alice, alice, USDC_100, SOURCE_ID);

        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        vm.expectRevert(MembershipSaleV3.SourceEscrowLocked.selector);
        sale.claimSourceEscrow(SOURCE_ID);

        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.REVOKED);
        vm.expectRevert(MembershipSaleV3.SourceEscrowLocked.selector);
        sale.claimSourceEscrow(SOURCE_ID);

        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 12_000_000, "historical escrow remains readable");
        assertEq(sale.totalAcquisitionEscrowed(), 12_000_000);
    }

    function test_claimSourceEscrow_requiresActiveSourceAfterPayoutRecovery() public {
        _createSource(1_200, 10_000e6);
        usdc.setBlocked(payoutWallet, true);
        _approve(alice, USDC_100);
        _buy(alice, alice, USDC_100, SOURCE_ID);

        address recoveredPayout = makeAddr("recoveredPayout");
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        sources.updatePayoutWallet(SOURCE_ID, recoveredPayout);
        vm.expectRevert(MembershipSaleV3.SourceEscrowLocked.selector);
        sale.claimSourceEscrow(SOURCE_ID);

        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        sale.claimSourceEscrow(SOURCE_ID);

        assertEq(usdc.balanceOf(recoveredPayout), 12_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
    }

    function test_claimSourceEscrow_revertsWhenNothingOwed() public {
        vm.expectRevert(MembershipSaleV3.NothingToClaim.selector);
        sale.claimSourceEscrow(SOURCE_ID);
    }

    function test_buy_repeatPurchaseUsesLinkedSourceUntilCap() public {
        _createSource(1_200, 200e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(sale.memberCount(), GEN + 1, "repeat does not mint second seat");
        assertEq(usdc.balanceOf(payoutWallet), 24_000_000, "linked source paid on repeat inside cap");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100 * 2);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100 * 2);
    }

    function test_buy_linkedSourceCapStopsCommissionButNotPurchase() public {
        _createSource(1_200, 100e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "second buy pays no capped commission");
        assertEq(usdc.balanceOf(vault), 70_000_000 + 61_600_000, "second buy routes full gross protocol split");
        assertEq(sale.totalGrossUsdc(), USDC_100 * 2);
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.totalProtocolContribution(), 188_000_000);
        assertEq(sale.receiptCount(), 2);
    }

    function test_buy_repeatAfterAttributionWindowExpiresDoesNotPayOrRewriteHistory() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        uint256 linkedExpiry = sale.buyerSourceExpiresAt(alice);

        vm.warp(linkedExpiry + 1);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "expired attribution pays only first buy");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100, "historical source gross is not rewritten");
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100, "buyer source history is preserved");
        assertEq(sale.buyerSourceId(alice), SOURCE_ID, "historical source link remains readable");
        assertEq(sale.buyerSourceExpiresAt(alice), linkedExpiry, "expiry record remains stable");
        assertEq(sale.totalGrossUsdc(), USDC_100 * 2);
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.totalProtocolContribution(), 188_000_000);
        assertEq(sale.receiptCount(), 2);
        _assertUsdcConservation(USDC_100 * 2);
    }

    function test_buy_pausedLinkedSourceReceivesNoAutoCommissionButExplicitPausedReverts() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100 * 3);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);

        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "paused linked source receives no new auto commission");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100, "paused source history remains unchanged");
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100);
        assertEq(sale.receiptCount(), 2);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_revokedLinkedSourceReceivesNoAutoCommissionAndCreatesNoNewAttribution() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100 * 3);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.REVOKED);

        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "revoked source receives no new commission");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100, "old receipt attribution remains readable");
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100, "old buyer-source record remains readable");
        assertEq(sale.buyerSourceId(alice), SOURCE_ID, "revocation does not erase history");
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.receiptCount(), 2);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_referrerLosesSeatStopsFutureCommissionWithoutRewritingHistory() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        uint256 sourceSyn = syn.balanceOf(sourceWallet);
        vm.prank(sourceWallet);
        syn.transfer(makeAddr("source-exit"), sourceSyn);

        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(syn.balanceOf(sourceWallet), 0, "source wallet is no longer seated");
        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "future commission stops");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100, "historical attribution preserved");
        assertEq(sale.buyerSourceId(alice), SOURCE_ID, "no fake recovery or history rewrite");
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.receiptCount(), 2);
    }

    function test_buy_firstPurchaseSourceDoesNotPayRepeatPurchase() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(1_200, 10_000e6);
        terms.scope = SourceRegistryV1.AttributionScope.FIRST_PURCHASE;
        terms.appliesToRepeatPurchases = false;
        _createSource(terms);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "first-purchase source pays once");
        assertEq(sale.buyerSourceId(alice), SOURCE_ID, "historical first source remains readable");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100);
    }

    function test_buy_attributionHijackBlockedWhileActiveAndReplacementBecomesCurrentAfterWindow() public {
        bytes32 secondSourceId = keccak256("SECOND_MEMBER_INTRODUCTION");
        address secondSourceWallet = makeAddr("secondSourceWallet");
        address secondPayoutWallet = makeAddr("secondPayoutWallet");
        _createSource(1_200, 10_000e6);
        SourceRegistryV1.SourceTerms memory secondTerms = _memberTerms(1_000, 10_000e6);
        secondTerms.sourceWallet = secondSourceWallet;
        secondTerms.payoutWallet = secondPayoutWallet;
        secondTerms.endTime = uint64(block.timestamp + 730 days);
        sources.createSource(secondSourceId, secondTerms);
        sources.setSourceStatus(secondSourceId, SourceRegistryV1.SourceStatus.ACTIVE);
        syn.mint(secondSourceWallet, 1 ether);
        _approve(alice, USDC_100 * 3);

        _buy(alice, alice, USDC_100, SOURCE_ID);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceAlreadyLinked.selector);
        sale.buy(USDC_100, alice, secondSourceId, 0, new bytes32[](0));

        uint256 linkedExpiry = sale.buyerSourceExpiresAt(alice);
        vm.warp(linkedExpiry + 1);
        _buy(alice, alice, USDC_100, secondSourceId);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "original source paid once");
        assertEq(usdc.balanceOf(secondPayoutWallet), 20_000_000, "new current source applies after replacement");
        assertEq(sale.buyerSourceId(alice), secondSourceId, "expired source no longer blocks current attribution");
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.sourceGrossAttributed(secondSourceId), USDC_100 * 2);
        assertEq(sale.buyerGrossAttributedToSource(SOURCE_ID, alice), USDC_100);
        assertEq(sale.buyerGrossAttributedToSource(secondSourceId, alice), USDC_100 * 2);
        assertEq(sale.receiptCount(), 3);
    }

    function test_buy_cappedLinkedSourceCanBeReplacedByExplicitValidSource() public {
        bytes32 secondSourceId = keccak256("SECOND_MEMBER_INTRODUCTION");
        address secondSourceWallet = makeAddr("secondSourceWallet");
        address secondPayoutWallet = makeAddr("secondPayoutWallet");
        _createSource(1_200, 100e6);
        SourceRegistryV1.SourceTerms memory secondTerms = _memberTerms(1_000, 10_000e6);
        secondTerms.sourceWallet = secondSourceWallet;
        secondTerms.payoutWallet = secondPayoutWallet;
        sources.createSource(secondSourceId, secondTerms);
        sources.setSourceStatus(secondSourceId, SourceRegistryV1.SourceStatus.ACTIVE);
        syn.mint(secondSourceWallet, 1 ether);
        _approve(alice, USDC_100 * 3);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        _buy(alice, alice, USDC_100, secondSourceId);
        _buy(alice, alice, USDC_100, bytes32(0));

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000, "capped original source paid only once");
        assertEq(usdc.balanceOf(secondPayoutWallet), 20_000_000, "replacement source becomes current");
        assertEq(sale.buyerSourceId(alice), secondSourceId);
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.sourceGrossAttributed(secondSourceId), USDC_100 * 2);
    }

    function test_buy_pausedLinkedSourceCanBeReplacedByExplicitValidSource() public {
        bytes32 secondSourceId = keccak256("SECOND_MEMBER_INTRODUCTION");
        address secondSourceWallet = makeAddr("secondSourceWallet");
        address secondPayoutWallet = makeAddr("secondPayoutWallet");
        _createSource(1_200, 10_000e6);
        SourceRegistryV1.SourceTerms memory secondTerms = _memberTerms(1_000, 10_000e6);
        secondTerms.sourceWallet = secondSourceWallet;
        secondTerms.payoutWallet = secondPayoutWallet;
        sources.createSource(secondSourceId, secondTerms);
        sources.setSourceStatus(secondSourceId, SourceRegistryV1.SourceStatus.ACTIVE);
        syn.mint(secondSourceWallet, 1 ether);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.PAUSED);
        _buy(alice, alice, USDC_100, secondSourceId);

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000);
        assertEq(usdc.balanceOf(secondPayoutWallet), 10_000_000);
        assertEq(sale.buyerSourceId(alice), secondSourceId);
    }

    function test_buy_revokedLinkedSourceCanBeReplacedByExplicitValidSource() public {
        bytes32 secondSourceId = keccak256("SECOND_MEMBER_INTRODUCTION");
        address secondSourceWallet = makeAddr("secondSourceWallet");
        address secondPayoutWallet = makeAddr("secondPayoutWallet");
        _createSource(1_200, 10_000e6);
        SourceRegistryV1.SourceTerms memory secondTerms = _memberTerms(1_000, 10_000e6);
        secondTerms.sourceWallet = secondSourceWallet;
        secondTerms.payoutWallet = secondPayoutWallet;
        sources.createSource(secondSourceId, secondTerms);
        sources.setSourceStatus(secondSourceId, SourceRegistryV1.SourceStatus.ACTIVE);
        syn.mint(secondSourceWallet, 1 ether);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, SOURCE_ID);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.REVOKED);
        _buy(alice, alice, USDC_100, secondSourceId);

        assertEq(usdc.balanceOf(payoutWallet), 12_000_000);
        assertEq(usdc.balanceOf(secondPayoutWallet), 10_000_000);
        assertEq(sale.buyerSourceId(alice), secondSourceId);
    }

    function test_buy_existingSeatedUnlinkedMemberCannotBeCapturedByNewSource() public {
        _createSource(1_200, 10_000e6);
        _approve(alice, USDC_100 * 2);

        _buy(alice, alice, USDC_100, bytes32(0));

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SourceNotEligible.selector);
        sale.buy(USDC_100, alice, SOURCE_ID, 0, new bytes32[](0));

        assertEq(sale.buyerSourceId(alice), bytes32(0));
        assertEq(usdc.balanceOf(payoutWallet), 0);
    }

    function test_buy_explicitCappedSourceReverts() public {
        _createSource(1_200, 100e6);
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
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        syn.mint(alice, 1 ether);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SelfReferral.selector);
        sale.buy(USDC_100, bob, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_payoutWalletCannotEqualBuyer() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500, 10_000e6);
        terms.payoutWallet = alice;
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SelfReferral.selector);
        sale.buy(USDC_100, bob, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_payoutWalletCannotEqualRecipient() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500, 10_000e6);
        terms.payoutWallet = bob;
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        _approve(alice, USDC_100);

        vm.prank(alice);
        vm.expectRevert(MembershipSaleV3.SelfReferral.selector);
        sale.buy(USDC_100, bob, SOURCE_ID, 0, new bytes32[](0));
    }

    function test_buy_unseatedPublicReferrerExplicitSourceReverts() public {
        SourceRegistryV1.SourceTerms memory terms = _memberTerms(500, 10_000e6);
        address unseated = makeAddr("unseated");
        terms.sourceWallet = unseated;
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
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
        _createSource(1_200, 10_000e6);

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
        assertEq(acquisitionCost, 12_000_000);
        assertEq(protocolContribution, 88_000_000);
    }
}

