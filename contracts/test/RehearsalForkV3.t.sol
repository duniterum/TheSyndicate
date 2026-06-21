// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {MembershipSaleV3} from "../src/MembershipSaleV3.sol";
import {SourceRegistryV1} from "../src/SourceRegistryV1.sol";
import {BlocklistERC20, MockERC20} from "./mocks/Tokens.sol";

interface IERC20Like {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

contract V3PassivePayoutWallet {}

/// @title Avalanche fork rehearsal for V3 candidates
/// @notice REHEARSAL ONLY. No private keys, no broadcast, no registry switch,
///         and no live V3 activation. Uses AVAX_RPC only when explicitly set.
///         With AVAX_RPC unset it skips the fork path, keeping default test runs
///         local and deterministic.
contract RehearsalForkV3Test is Test {
    address constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address constant SYN = 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170;
    address constant VAULT = 0x205DdC8921A4C60106930eE35e1F395c8D13f464;
    address constant LIQUIDITY = 0xa9b072db8DcDbb470235204B69D37275d74a2e25;
    address constant OPERATIONS = 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80;
    address constant V2B_LIVE_SALE = 0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b;
    address constant ARCHIVE1155 = 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d;

    bytes32 constant SOURCE_ID = keccak256("V3_REHEARSAL_MEMBER_SOURCE");
    bytes32 constant META = keccak256("ipfs://v3-rehearsal-source-policy");
    uint256 constant GENESIS_OFFSET = 333;
    uint256 constant USDC_10 = 10_000_000;
    uint256 constant USDC_100 = 100_000_000;
    uint256 constant MAX_USDC_PER_TX = 25_000_000_000;
    uint256 constant RESERVE_THROUGH_SEAT = 10_000;
    uint256 constant FUND = 50_000_000 ether;

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

    SourceRegistryV1 internal sources;
    MembershipSaleV3 internal sale;

    address internal ownerCandidate = makeAddr("v3-owner-hardware-candidate");
    address internal sourceWallet = makeAddr("v3-source-wallet");
    address internal payoutWallet = makeAddr("v3-payout-wallet");
    address internal buyer = makeAddr("v3-buyer");
    address internal sourceBuyer = makeAddr("v3-source-buyer");

    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 25_000_000_000;
        a[1] = 1_000_000_000;
        a[2] = 2_500_000_000;
        a[3] = 5_000_000_000;
        a[4] = 10_000_000_000;
        a[5] = 15_000_000_000;
        a[6] = 20_000_000_000;
        a[7] = 25_000_000_000;
        a[8] = 25_000_000_000;
    }

    function _eraCaps() internal pure returns (uint256[9] memory c) {
        c[0] = 0;
        c[1] = 416_875 ether;
        c[2] = 1_166_500 ether;
        c[3] = 3_333_500 ether;
        c[4] = 6_750_000 ether;
        c[5] = 11_250_000 ether;
        c[6] = 15_000_000 ether;
        c[7] = 60_000_000 ether;
        c[8] = 150_000_000 ether;
    }

    function _sourceTerms(uint16 bps) internal view returns (SourceRegistryV1.SourceTerms memory terms) {
        terms = SourceRegistryV1.SourceTerms({
            sourceWallet: sourceWallet,
            sourceClass: SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION,
            commissionBps: bps,
            scope: SourceRegistryV1.AttributionScope.WINDOWED,
            startTime: uint64(block.timestamp),
            endTime: uint64(block.timestamp + 365 days),
            grossCap: 1_000_000e6,
            perBuyerCap: 10_000e6,
            appliesToRepeatPurchases: true,
            payoutWallet: payoutWallet,
            metadataHash: META
        });
    }

    function _deployV3(address usdc, address syn) internal {
        sources = new SourceRegistryV1();
        sale = new MembershipSaleV3(
            usdc,
            syn,
            address(sources),
            VAULT,
            LIQUIDITY,
            OPERATIONS,
            GENESIS_OFFSET,
            bytes32(0),
            _addrCaps(),
            MAX_USDC_PER_TX,
            RESERVE_THROUGH_SEAT,
            _eraCaps()
        );
    }

    function _acceptOwnershipShape() internal {
        sources.transferOwnership(ownerCandidate);
        sale.transferOwnership(ownerCandidate);
        assertEq(sources.pendingOwner(), ownerCandidate, "registry pending owner");
        assertEq(sale.pendingOwner(), ownerCandidate, "sale pending owner");
        vm.startPrank(ownerCandidate);
        sources.acceptOwnership();
        sale.acceptOwnership();
        vm.stopPrank();
        assertEq(sources.owner(), ownerCandidate, "registry owner accepted");
        assertEq(sale.owner(), ownerCandidate, "sale owner accepted");
    }

    function _approveRealUsdc(address who, uint256 amount) internal {
        deal(USDC, who, amount);
        vm.prank(who);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
    }

    function test_rehearsalV3ConstantsMatchReadinessPackage() public pure {
        assertEq(USDC, 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E, "Avalanche USDC address drift");
        assertEq(SYN, 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170, "SYN address drift");
        assertEq(VAULT, 0x205DdC8921A4C60106930eE35e1F395c8D13f464, "Vault address drift");
        assertEq(LIQUIDITY, 0xa9b072db8DcDbb470235204B69D37275d74a2e25, "Liquidity address drift");
        assertEq(OPERATIONS, 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80, "Operations address drift");
        assertEq(V2B_LIVE_SALE, 0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b, "V2b live sale address drift");
        assertEq(ARCHIVE1155, 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d, "Archive1155 address drift");
    }

    function test_forkRehearsalV3_fullFlow() public {
        string memory rpc = vm.envOr("AVAX_RPC", string(""));
        if (bytes(rpc).length == 0) {
            emit log("AVAX_RPC unset -> skipping V3 Avalanche fork rehearsal");
            vm.skip(true);
            return;
        }
        uint256 forkBlock = vm.envOr("AVAX_FORK_BLOCK", uint256(0));
        if (forkBlock > 0) {
            vm.createSelectFork(rpc, forkBlock);
        } else {
            vm.createSelectFork(rpc);
        }

        assertGt(USDC.code.length, 0, "USDC exists on fork");
        assertGt(SYN.code.length, 0, "SYN exists on fork");
        assertGt(V2B_LIVE_SALE.code.length, 0, "V2b remains deployed/historical-live");
        assertGt(ARCHIVE1155.code.length, 0, "Archive1155 remains deployed memory contract");

        _deployV3(USDC, SYN);
        _acceptOwnershipShape();
        deal(SYN, address(sale), FUND);

        assertEq(address(sale.USDC()), USDC);
        assertEq(address(sale.SYN()), SYN);
        assertEq(address(sale.SOURCE_REGISTRY()), address(sources));
        assertEq(sale.VAULT(), VAULT);
        assertEq(sale.LIQUIDITY(), LIQUIDITY);
        assertEq(sale.OPERATIONS(), OPERATIONS);
        assertEq(sale.GENESIS_OFFSET(), GENESIS_OFFSET);
        assertEq(sale.MAX_USDC_PER_TX(), MAX_USDC_PER_TX);
        assertEq(sale.RESERVE_THROUGH_SEAT(), RESERVE_THROUGH_SEAT);
        assertEq(sale.currentEra(), 2, "seat #334 starts Era II");
        assertEq(sale.nextSeatNumber(), GENESIS_OFFSET + 1);
        assertEq(sale.availableSyn(), FUND);

        vm.prank(ownerCandidate);
        sources.createSource(SOURCE_ID, _sourceTerms(1_200));
        vm.prank(ownerCandidate);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        SourceRegistryV1.SourceRecord memory record = sources.sourceConfig(SOURCE_ID);
        assertEq(record.sourceWallet, sourceWallet);
        assertEq(record.payoutWallet, payoutWallet);
        assertEq(record.commissionBps, 1_200);
        assertEq(uint8(record.status), uint8(SourceRegistryV1.SourceStatus.ACTIVE));

        deal(SYN, sourceWallet, 1 ether);

        (uint256 noSourceSyn, uint16 era, uint64 synPerUsdc, uint256 firstSeat, uint256 acquisition, uint256 net) =
            sale.quote(USDC_10, buyer, bytes32(0));
        assertEq(noSourceSyn, USDC_10 * 50 * 1e12);
        assertEq(era, 2);
        assertEq(synPerUsdc, 50);
        assertEq(firstSeat, GENESIS_OFFSET + 1);
        assertEq(acquisition, 0);
        assertEq(net, USDC_10);

        uint256 vaultBefore = IERC20Like(USDC).balanceOf(VAULT);
        uint256 liquidityBefore = IERC20Like(USDC).balanceOf(LIQUIDITY);
        uint256 operationsBefore = IERC20Like(USDC).balanceOf(OPERATIONS);
        _approveRealUsdc(buyer, USDC_10);
        vm.prank(buyer);
        sale.buy(USDC_10, buyer, bytes32(0), 0, new bytes32[](0));
        assertEq(sale.memberNumberOf(buyer), GENESIS_OFFSET + 1, "no-source buyer gets first V3 rehearsal seat");
        assertEq(sale.receiptCount(), 1);
        assertEq(IERC20Like(USDC).balanceOf(VAULT) - vaultBefore, 7_000_000);
        assertEq(IERC20Like(USDC).balanceOf(LIQUIDITY) - liquidityBefore, 2_000_000);
        assertEq(IERC20Like(USDC).balanceOf(OPERATIONS) - operationsBefore, 1_000_000);

        bytes32 expectedReceiptId = keccak256(abi.encode(block.chainid, address(sale), uint256(2)));
        _approveRealUsdc(sourceBuyer, USDC_100);
        vm.expectEmit(true, true, true, true, address(sale));
        emit MembershipPurchasedV3(
            expectedReceiptId,
            sourceBuyer,
            sourceBuyer,
            GENESIS_OFFSET + 2,
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
            record.endTime,
            record.grossCap - USDC_100,
            record.perBuyerCap - USDC_100,
            true,
            sale.RECEIPT_VERSION()
        );
        vm.prank(sourceBuyer);
        sale.buy(USDC_100, sourceBuyer, SOURCE_ID, 0, new bytes32[](0));

        assertEq(IERC20Like(USDC).balanceOf(payoutWallet), 12_000_000, "source payout pushed");
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0, "no escrow on normal payout");
        assertEq(sale.totalAcquisitionEscrowed(), 0);
        assertEq(sale.memberNumberOf(sourceBuyer), GENESIS_OFFSET + 2);
        assertEq(sale.memberCount(), GENESIS_OFFSET + 2);
        assertEq(sale.sourceGrossAttributed(SOURCE_ID), USDC_100);
        assertEq(sale.totalGrossUsdc(), USDC_10 + USDC_100);
        assertEq(sale.totalAcquisitionCost(), 12_000_000);
        assertEq(sale.totalProtocolContribution(), USDC_10 + 88_000_000);

        console2.log("V3 fork rehearsal OK: readbacks, no-source buy, source buy, receipt, V2b/Archive posture.");
    }

    function test_rehearsalV3_blockedPayoutEscrowsWithoutBlockingBuy_shape() public {
        BlocklistERC20 rehearsalUsdc = new BlocklistERC20("USD Coin", "USDC", 6);
        MockERC20 rehearsalSyn = new MockERC20("Syndicate", "SYN", 18);
        _deployV3(address(rehearsalUsdc), address(rehearsalSyn));
        rehearsalSyn.mint(address(sale), FUND);

        vm.prank(address(this));
        sources.createSource(SOURCE_ID, _sourceTerms(1_200));
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        rehearsalSyn.mint(sourceWallet, 1 ether);
        rehearsalUsdc.setBlocked(payoutWallet, true);
        rehearsalUsdc.mint(sourceBuyer, USDC_100);
        vm.prank(sourceBuyer);
        rehearsalUsdc.approve(address(sale), type(uint256).max);

        vm.prank(sourceBuyer);
        sale.buy(USDC_100, sourceBuyer, SOURCE_ID, 0, new bytes32[](0));

        assertEq(sale.memberNumberOf(sourceBuyer), GENESIS_OFFSET + 1, "blocked payout does not block seat");
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 12_000_000, "source commission escrowed");
        assertEq(sale.totalAcquisitionEscrowed(), 12_000_000);
        assertEq(rehearsalUsdc.balanceOf(address(sale)), 12_000_000, "only escrow remains on sale");
        assertEq(rehearsalUsdc.balanceOf(VAULT), 61_600_000);
        assertEq(rehearsalUsdc.balanceOf(LIQUIDITY), 17_600_000);
        assertEq(rehearsalUsdc.balanceOf(OPERATIONS), 8_800_000);
    }

    function test_rehearsalV3_smartWalletPayoutCompatibility_shape() public {
        V3PassivePayoutWallet contractWallet = new V3PassivePayoutWallet();
        MockERC20 rehearsalUsdc = new MockERC20("USD Coin", "USDC", 6);
        MockERC20 rehearsalSyn = new MockERC20("Syndicate", "SYN", 18);
        _deployV3(address(rehearsalUsdc), address(rehearsalSyn));
        rehearsalSyn.mint(address(sale), FUND);

        SourceRegistryV1.SourceTerms memory terms = _sourceTerms(1_200);
        terms.payoutWallet = address(contractWallet);
        sources.createSource(SOURCE_ID, terms);
        sources.setSourceStatus(SOURCE_ID, SourceRegistryV1.SourceStatus.ACTIVE);
        rehearsalSyn.mint(sourceWallet, 1 ether);
        rehearsalUsdc.mint(sourceBuyer, USDC_100);
        vm.prank(sourceBuyer);
        rehearsalUsdc.approve(address(sale), type(uint256).max);

        vm.prank(sourceBuyer);
        sale.buy(USDC_100, sourceBuyer, SOURCE_ID, 0, new bytes32[](0));

        assertEq(rehearsalUsdc.balanceOf(address(contractWallet)), 12_000_000);
        assertEq(sale.sourceEscrowOwed(SOURCE_ID), 0);
        assertEq(sale.totalAcquisitionEscrowed(), 0);
    }
}

