// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {MembershipSaleV3} from "../src/MembershipSaleV3.sol";
import {SourceRegistryV1} from "../src/SourceRegistryV1.sol";
import {BlocklistERC20, MockERC20} from "./mocks/Tokens.sol";

/// @title V3HistoricalMemberRootTest
/// @notice Verifies the committed freeze-block 88496414 numbered historical-member proof artifact.
contract V3HistoricalMemberRootTest is Test {
    BlocklistERC20 internal usdc;
    MockERC20 internal syn;
    SourceRegistryV1 internal sources;
    MembershipSaleV3 internal sale;

    address internal vault = makeAddr("vault");
    address internal liquidity = makeAddr("liquidity");
    address internal operations = makeAddr("operations");
    address internal unknown = makeAddr("unknown");

    uint256 internal constant GENESIS_OFFSET = 8;
    uint256 internal constant USDC_5 = 5_000_000;
    uint256 internal constant MAXTX = 1_000_000_000_000;
    uint256 internal constant FUND = 1e27;
    bytes32 internal constant GENERATED_ROOT = 0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329;

    function setUp() public {
        usdc = new BlocklistERC20("USD Coin", "USDC", 6);
        syn = new MockERC20("Syndicate", "SYN", 18);
        sources = new SourceRegistryV1();
        sale = _deploy(GENERATED_ROOT);
        syn.mint(address(sale), FUND);
    }

    function _deploy(bytes32 root) internal returns (MembershipSaleV3 s) {
        s = new MembershipSaleV3(
            address(usdc),
            address(syn),
            address(sources),
            vault,
            liquidity,
            operations,
            GENESIS_OFFSET,
            root,
            _addrCaps(),
            MAXTX,
            0,
            _eraCaps()
        );
    }

    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 5_000_000;
        for (uint256 i = 1; i < 9; ++i) a[i] = 1e15;
    }

    function _eraCaps() internal pure returns (uint256[9] memory c) {
        c[0] = 0;
        for (uint256 i = 1; i < 9; ++i) c[i] = 1e30;
    }

    function _approve(address buyer, uint256 amount) internal {
        usdc.mint(buyer, amount);
        vm.prank(buyer);
        usdc.approve(address(sale), type(uint256).max);
    }

    function _member(uint256 memberNumber) internal pure returns (address) {
        if (memberNumber == 1) return 0x244531C571966f90f4849e03a507543d90f9C721;
        if (memberNumber == 2) return 0x3488857b003104e2B08A1D198f8a23BFF28B0045;
        if (memberNumber == 3) return 0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0;
        if (memberNumber == 4) return 0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a;
        if (memberNumber == 5) return 0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD;
        if (memberNumber == 6) return 0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9;
        if (memberNumber == 7) return 0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F;
        if (memberNumber == 8) return 0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081;
        revert("unknown member");
    }

    function _proof(uint256 memberNumber) internal pure returns (bytes32[] memory p) {
        p = new bytes32[](3);
        if (memberNumber == 1) {
            p[0] = 0xf1f56062bda188b35f757425cc90ac24c888a3afb50357b063666db4507a4209;
            p[1] = 0x7e6356225594ba4ab1ae1d2b6afe9d269797002725ae45fbed3616b7a30ad5e2;
            p[2] = 0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536;
        } else if (memberNumber == 2) {
            p[0] = 0x748349d18f3661123556d4255df71826deee65aacd7bdf6aec544390e8d15e5a;
            p[1] = 0x7e6356225594ba4ab1ae1d2b6afe9d269797002725ae45fbed3616b7a30ad5e2;
            p[2] = 0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536;
        } else if (memberNumber == 3) {
            p[0] = 0xf41eee93a6dfa8def509e4c397775320f937cd620fbd41117f225e0522375006;
            p[1] = 0xcecd90de18aa5e2bfdfaefe07fba9bf97496e76f187013046f49a9a0557f49ed;
            p[2] = 0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536;
        } else if (memberNumber == 4) {
            p[0] = 0x7f2f2c090417335c191d571feef7dd34ba19a708a072430ee24a0b8782e90d92;
            p[1] = 0xcecd90de18aa5e2bfdfaefe07fba9bf97496e76f187013046f49a9a0557f49ed;
            p[2] = 0x5ab1edcae10666d68795427a00f0be2db8ec06025aa502bf1d089029974f3536;
        } else if (memberNumber == 5) {
            p[0] = 0xef099fde9e9e90e0826ed7f41325e5d442e03bac6bc7167916dd98399b23390f;
            p[1] = 0xb22f0011a15b37f3b819bd24a44ac6d8a1bddcb5f55d4ff792d4a2316656da68;
            p[2] = 0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d;
        } else if (memberNumber == 6) {
            p[0] = 0xc274bb30e98757af0d3d2c8852478b42c8e39afdb7294afef2244193517206f5;
            p[1] = 0xb22f0011a15b37f3b819bd24a44ac6d8a1bddcb5f55d4ff792d4a2316656da68;
            p[2] = 0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d;
        } else if (memberNumber == 7) {
            p[0] = 0x6c1d25411a266596df8ea36b26f5a0f9a7abc8658acc5fd1d8dc175b9e7f56ab;
            p[1] = 0x45c05dfc0408ab24a911c263b628d14c25845ffbb0c14e70ce75c730ecbe9558;
            p[2] = 0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d;
        } else if (memberNumber == 8) {
            p[0] = 0xdf73f7d88e872a00992a7f5d889752625ce3ce03c920bb8240d522f16734b4ba;
            p[1] = 0x45c05dfc0408ab24a911c263b628d14c25845ffbb0c14e70ce75c730ecbe9558;
            p[2] = 0x7c36e9862201345ea6c3e53a682e2153db620abbfd431f9431c2e53732835e0d;
        } else {
            revert("unknown proof");
        }
    }

    function _historicalLeaf(address who, uint256 memberNumber) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(who, memberNumber))));
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(bytes.concat(a, b)) : keccak256(bytes.concat(b, a));
    }

    function test_allEightGeneratedProofsClaimCorrectMemberNumbers() public {
        for (uint256 memberNumber = 1; memberNumber <= 8; ++memberNumber) {
            address wallet = _member(memberNumber);
            vm.prank(wallet);
            sale.claimHistoricalMembership(memberNumber, _proof(memberNumber));

            assertTrue(sale.knownMember(wallet), "wallet recognized");
            assertEq(sale.memberNumberOf(wallet), memberNumber, "member number preserved");
            assertEq(sale.memberByNumber(memberNumber), wallet, "number maps back to wallet");
        }
        assertEq(sale.memberCount(), GENESIS_OFFSET, "claims do not inflate member count");
    }

    function test_wrongWalletFails() public {
        vm.expectRevert(MembershipSaleV3.InvalidProof.selector);
        vm.prank(unknown);
        sale.claimHistoricalMembership(1, _proof(1));
    }

    function test_wrongMemberNumberFails() public {
        vm.expectRevert(MembershipSaleV3.InvalidProof.selector);
        vm.prank(_member(1));
        sale.claimHistoricalMembership(2, _proof(1));
    }

    function test_memberNumberZeroFails() public {
        vm.expectRevert(abi.encodeWithSelector(MembershipSaleV3.InvalidHistoricalMemberNumber.selector, 0));
        vm.prank(_member(1));
        sale.claimHistoricalMembership(0, _proof(1));
    }

    function test_duplicateMemberNumberCannotBeAcceptedEvenIfRootContainsDuplicateNumber() public {
        address first = makeAddr("first-duplicate-number");
        address second = makeAddr("second-duplicate-number");
        bytes32 root = _hashPair(_historicalLeaf(first, 1), _historicalLeaf(second, 1));
        MembershipSaleV3 duplicateSale = _deploy(root);

        bytes32[] memory firstProof = new bytes32[](1);
        firstProof[0] = _historicalLeaf(second, 1);
        vm.prank(first);
        duplicateSale.claimHistoricalMembership(1, firstProof);

        bytes32[] memory secondProof = new bytes32[](1);
        secondProof[0] = _historicalLeaf(first, 1);
        vm.expectRevert(abi.encodeWithSelector(MembershipSaleV3.HistoricalMemberNumberTaken.selector, 1));
        vm.prank(second);
        duplicateSale.claimHistoricalMembership(1, secondProof);
    }

    function test_rootMismatchFails() public {
        MembershipSaleV3 wrongRootSale = _deploy(bytes32(uint256(GENERATED_ROOT) ^ uint256(1)));
        vm.expectRevert(MembershipSaleV3.InvalidProof.selector);
        vm.prank(_member(1));
        wrongRootSale.claimHistoricalMembership(1, _proof(1));
    }

    function test_historicalMemberCanClaimThenBuyWithoutFirstSeat() public {
        address wallet = _member(1);
        vm.prank(wallet);
        sale.claimHistoricalMembership(1, _proof(1));

        _approve(wallet, USDC_5);
        vm.prank(wallet);
        sale.buy(USDC_5, wallet, bytes32(0), 0, new bytes32[](0));

        assertEq(sale.memberNumberOf(wallet), 1, "historical member number preserved");
        assertEq(sale.memberCount(), GENESIS_OFFSET, "buy did not create a new seat number");
        assertEq(sale.receiptCount(), 1, "purchase receipt recorded");
    }

    function test_unknownWalletStillReceivesNewV3MemberNumber() public {
        _approve(unknown, USDC_5);
        vm.prank(unknown);
        sale.buy(USDC_5, unknown, bytes32(0), 0, new bytes32[](0));

        assertEq(sale.memberNumberOf(unknown), GENESIS_OFFSET + 1, "unknown gets next V3 number");
        assertEq(sale.memberByNumber(GENESIS_OFFSET + 1), unknown, "new number maps to wallet");
        assertEq(sale.memberCount(), GENESIS_OFFSET + 1, "new V3 member count increments");
    }
}
