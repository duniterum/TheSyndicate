// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SyndicateSaleV2} from "../src/SyndicateSaleV2.sol";
import {CommissionRouterV1} from "../src/CommissionRouterV1.sol";
import {MockERC20} from "./mocks/Tokens.sol";
import {RevertingRouter, ReentrantRouter} from "./mocks/RouterMocks.sol";

/// @title  SyndicateSaleV2 tests
/// @notice Covers constructor validation, the buy path + split conservation,
///         dual-bound era advance (range + cap), per-tx / per-address / per-era
///         caps, the seat reserve floor, Merkle V1 recognition (proof = no new
///         seat; no-proof = M2 double-count), router fallback/integration/timelock,
///         pause + timelocked recovery, protected-token rescue, reentrancy, fuzz.
contract SyndicateSaleV2Test is Test {
    MockERC20 internal usdc; // 6dp
    MockERC20 internal syn;  // 18dp
    SyndicateSaleV2 internal sale;

    address internal vault     = makeAddr("vault");
    address internal liquidity = makeAddr("liquidity");
    address internal operations = makeAddr("operations");

    // V1 member set (2-leaf Merkle tree) for proof tests
    address internal v1A = makeAddr("v1A");
    address internal v1B = makeAddr("v1B");
    bytes32 internal root;

    uint256 internal constant GEN = 333;          // handoff offset => starts Era II
    uint256 internal constant USDC_10 = 10_000_000;   // $10  (era II minimum)
    uint256 internal constant USDC_20 = 20_000_000;   // $20
    uint256 internal constant USDC_100 = 100_000_000; // $100
    uint256 internal constant MAXTX = 1_000_000_000_000; // $1,000,000
    uint256 internal constant FUND = 1e27;        // 1,000,000,000 SYN
    uint256 internal constant ERA2_MIN_ENTRY = 5e20; // $10 * 50 * 1e12 = 500 SYN

    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber, uint8 reason);
    event CommissionRouterFallback(uint256 indexed memberNumber, uint256 operationsAmount);
    event V1MembershipRecognized(address indexed member);
    event UnsoldSynRecovered(address indexed to, uint256 amount);

    function setUp() public {
        usdc = new MockERC20("USD Coin", "USDC", 6);
        syn = new MockERC20("Syndicate", "SYN", 18);
        root = _root2(v1A, v1B);
        sale = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root);
        syn.mint(address(sale), FUND);
    }

    // ------------------------------------------------------------- builders
    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 5_000_000;            // era 1 (non-sellable here)
        for (uint256 i = 1; i < 9; ++i) a[i] = 1e15; // large for eras 2..9
    }

    function _eraCaps() internal pure returns (uint256[9] memory c) {
        c[0] = 0;                    // era 1 unused by V2
        for (uint256 i = 1; i < 9; ++i) c[i] = 1e30; // large SYN caps
    }

    function _deploy(
        uint256 genesisOffset,
        uint256[9] memory addrCaps,
        uint256 maxTx,
        uint256 reserve,
        uint256[9] memory eraCaps,
        address initialRouter,
        bytes32 r
    ) internal returns (SyndicateSaleV2 s) {
        s = new SyndicateSaleV2(
            address(usdc), address(syn), vault, liquidity, operations,
            genesisOffset, r, addrCaps, maxTx, reserve, eraCaps, initialRouter
        );
    }

    // --------------------------------------------------------- merkle helpers
    function _leaf(address a) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(a))));
    }

    function _root2(address a, address b) internal pure returns (bytes32) {
        bytes32 la = _leaf(a);
        bytes32 lb = _leaf(b);
        return la < lb ? keccak256(abi.encodePacked(la, lb)) : keccak256(abi.encodePacked(lb, la));
    }

    function _proof2(address sibling) internal pure returns (bytes32[] memory pr) {
        pr = new bytes32[](1);
        pr[0] = _leaf(sibling);
    }

    function _noProof() internal pure returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    // ------------------------------------------------------------ buy helpers
    function _approve(SyndicateSaleV2 s, address who, uint256 amt) internal {
        usdc.mint(who, amt);
        vm.prank(who);
        usdc.approve(address(s), type(uint256).max);
    }

    function _buy(SyndicateSaleV2 s, address who, uint256 usdcIn, address ref, bytes32[] memory proof) internal {
        vm.prank(who);
        s.buy(usdcIn, ref, 0, proof);
    }

    // ============================================================ constructor
    function test_ctor_zeroAddressReverts() public {
        vm.expectRevert(SyndicateSaleV2.ZeroAddress.selector);
        new SyndicateSaleV2(
            address(0), address(syn), vault, liquidity, operations,
            GEN, root, _addrCaps(), MAXTX, 0, _eraCaps(), address(0)
        );
    }

    function test_ctor_badGenesisOffsetReverts() public {
        vm.expectRevert(SyndicateSaleV2.BadGenesisOffset.selector);
        _deploy(332, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root); // < 333
        vm.expectRevert(SyndicateSaleV2.BadGenesisOffset.selector);
        _deploy(1_000_000, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root); // >= FINAL
    }

    function test_ctor_zeroMaxTxReverts() public {
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, _addrCaps(), 0, 0, _eraCaps(), address(0), root);
    }

    function test_ctor_badReserveReverts() public {
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, _addrCaps(), MAXTX, 200, _eraCaps(), address(0), root); // <= GENESIS_END
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, _addrCaps(), MAXTX, 1_000_001, _eraCaps(), address(0), root); // > FINAL
    }

    function test_ctor_eraCapTooSmallReverts() public {
        uint256[9] memory caps = _eraCaps();
        caps[1] = ERA2_MIN_ENTRY - 1; // era 2 cap below one min entry
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, _addrCaps(), MAXTX, 0, caps, address(0), root);
    }

    function test_ctor_addrCapBelowMinReverts() public {
        uint256[9] memory a = _addrCaps();
        a[1] = USDC_10 - 1; // era 2 addr cap below era min
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, a, MAXTX, 0, _eraCaps(), address(0), root);
    }

    function test_ctor_maxTxBelowEraMinReverts() public {
        // maxTx below the largest sellable era minimum (era IX = $100)
        vm.expectRevert(SyndicateSaleV2.BadEraCaps.selector);
        _deploy(GEN, _addrCaps(), USDC_10, 0, _eraCaps(), address(0), root);
    }

    function test_ctor_state() public view {
        assertEq(sale.memberCount(), GEN);
        assertEq(sale.activeEra(), 2);
        assertEq(sale.GENESIS_OFFSET(), GEN);
        assertEq(sale.V1_MEMBER_ROOT(), root);
        assertEq(sale.availableSyn(), FUND);
        assertEq(sale.owner(), address(this));
    }

    // ================================================================== buy
    function test_buy_happyNewSeat() public {
        _approve(sale, makeAddr("alice"), USDC_100);
        address alice = makeAddr("alice");
        _buy(sale, alice, USDC_100, address(0), _noProof());

        uint256 expSyn = USDC_100 * 50 * 1e12; // 5000 SYN
        assertEq(syn.balanceOf(alice), expSyn);
        assertEq(sale.memberCount(), GEN + 1);
        assertEq(sale.memberNumberOf(alice), GEN + 1);
        assertTrue(sale.knownMember(alice));
        assertEq(sale.totalSynSold(), expSyn);
        assertEq(sale.totalUsdcRaised(), USDC_100);
        assertEq(sale.soldInEra(2), expSyn);
        assertEq(sale.usdcContributed(alice), USDC_100);

        // 70 / 20 / 10 routing (router unset => full ops to OPERATIONS)
        assertEq(usdc.balanceOf(vault), 70_000_000);
        assertEq(usdc.balanceOf(liquidity), 20_000_000);
        assertEq(usdc.balanceOf(operations), 10_000_000);
        assertEq(usdc.balanceOf(address(sale)), 0, "no USDC retained");
    }

    function test_buy_splitConservation() public {
        address bob = makeAddr("bob");
        _approve(sale, bob, USDC_100);
        _buy(sale, bob, USDC_100, address(0), _noProof());
        uint256 sum = usdc.balanceOf(vault) + usdc.balanceOf(liquidity) + usdc.balanceOf(operations);
        assertEq(sum, USDC_100);
        assertEq(usdc.balanceOf(address(sale)), 0);
    }

    function test_buy_belowMinReverts() public {
        address c = makeAddr("c");
        _approve(sale, c, USDC_10);
        vm.prank(c);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.BelowEraMinimum.selector, USDC_10));
        sale.buy(USDC_10 - 1, address(0), 0, _noProof());
    }

    function test_buy_exceedsTxMaxReverts() public {
        // deploy with maxTx == era IX min ($100); buy $101
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), USDC_100, 0, _eraCaps(), address(0), root);
        syn.mint(address(s), FUND);
        address d = makeAddr("d");
        _approve(s, d, 200_000_000);
        vm.prank(d);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.ExceedsTxMax.selector, USDC_100));
        s.buy(101_000_000, address(0), 0, _noProof());
    }

    function test_buy_addressEraCapReverts() public {
        uint256[9] memory a = _addrCaps();
        a[1] = USDC_100; // era 2 per-address cap = $100
        SyndicateSaleV2 s = _deploy(GEN, a, MAXTX, 0, _eraCaps(), address(0), root);
        syn.mint(address(s), FUND);
        address e = makeAddr("e");
        _approve(s, e, 1_000_000_000);
        _buy(s, e, USDC_100, address(0), _noProof()); // hits the cap exactly
        vm.prank(e);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.AddressEraCapExceeded.selector, 0));
        s.buy(USDC_10, address(0), 0, _noProof());
    }

    function test_buy_slippageReverts() public {
        address f = makeAddr("f");
        _approve(sale, f, USDC_100);
        uint256 expSyn = USDC_100 * 50 * 1e12;
        vm.prank(f);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.SlippageExceeded.selector, expSyn, expSyn + 1));
        sale.buy(USDC_100, address(0), expSyn + 1, _noProof());
    }

    function test_buy_eraInventoryInsufficientReverts() public {
        // era 2 cap == one min entry; buy $20 (needs 2 entries) => revert, no advance
        uint256[9] memory caps = _eraCaps();
        caps[1] = ERA2_MIN_ENTRY;
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, caps, address(0), root);
        syn.mint(address(s), FUND);
        address g = makeAddr("g");
        _approve(s, g, USDC_100);
        vm.prank(g);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.EraInventoryInsufficient.selector, ERA2_MIN_ENTRY));
        s.buy(USDC_20, address(0), 0, _noProof());
    }

    function test_buy_insufficientInventoryReverts() public {
        // fund with less than one $10 buy needs
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root);
        syn.mint(address(s), 1e20); // < 5e20 needed
        address h = makeAddr("h");
        _approve(s, h, USDC_100);
        vm.prank(h);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.InsufficientInventory.selector, 1e20));
        s.buy(USDC_10, address(0), 0, _noProof());
    }

    // ============================================================ era engine
    function test_eraAdvance_byCap() public {
        uint256[9] memory caps = _eraCaps();
        caps[1] = ERA2_MIN_ENTRY; // exactly one entry in era 2
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, caps, address(0), root);
        syn.mint(address(s), FUND);

        address a1 = makeAddr("a1");
        _approve(s, a1, USDC_100);
        _buy(s, a1, USDC_10, address(0), _noProof()); // fills era 2 cap
        assertEq(s.currentEra(), 3, "view advances once cap can't fit a min entry");

        address a2 = makeAddr("a2");
        _approve(s, a2, USDC_100);
        vm.expectEmit(true, true, false, true);
        emit EraAdvanced(2, 3, s.memberCount() + 1, 1); // REASON_CAP
        _buy(s, a2, USDC_10, address(0), _noProof());
        assertEq(s.activeEra(), 3);
        // era 3 rate = 40 SYN/USDC
        assertEq(syn.balanceOf(a2), USDC_10 * 40 * 1e12);
    }

    function test_eraAdvance_byRange() public {
        // start one seat before the era II ceiling (seat 1000)
        SyndicateSaleV2 s = _deploy(999, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root);
        syn.mint(address(s), FUND);

        address a1 = makeAddr("ra1");
        _approve(s, a1, USDC_100);
        _buy(s, a1, USDC_10, address(0), _noProof()); // seats #1000
        assertEq(s.memberCount(), 1000);
        assertEq(s.currentEra(), 3, "range filled => view advances");

        address a2 = makeAddr("ra2");
        _approve(s, a2, USDC_100);
        vm.expectEmit(true, true, false, true);
        emit EraAdvanced(2, 3, 1001, 0); // REASON_RANGE, opens at endSeat+1
        _buy(s, a2, USDC_10, address(0), _noProof());
        assertEq(s.activeEra(), 3);
    }

    function test_eraOfSeat_positional() public view {
        assertEq(sale.eraOfSeat(1), 1);
        assertEq(sale.eraOfSeat(333), 1);
        assertEq(sale.eraOfSeat(334), 2);
        assertEq(sale.eraOfSeat(1000), 2);
        assertEq(sale.eraOfSeat(1001), 3);
        assertEq(sale.eraOfSeat(1_000_000), 9);
    }

    // ============================================================= reserve
    function test_reserveFloor_blocksOverdraw() public {
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 10_000, _eraCaps(), address(0), root);
        uint256 floor = s.currentReserveFloor();
        assertGt(floor, 0);
        syn.mint(address(s), floor); // fund EXACTLY the reserve

        uint256 sn = s.sellableSynForNextSeat();
        assertEq(sn, ERA2_MIN_ENTRY, "headroom == one era II seat");

        address z = makeAddr("z");
        _approve(s, z, USDC_100);
        // $20 needs 2 entries but only 1 seat of headroom remains => revert
        vm.prank(z);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.ReserveFloorViolation.selector, sn));
        s.buy(USDC_20, address(0), 0, _noProof());

        // a single-seat buy fits exactly
        _buy(s, z, USDC_10, address(0), _noProof());
        assertEq(s.memberCount(), GEN + 1);
    }

    function test_reserveDisabled_floorZero() public view {
        assertEq(sale.currentReserveFloor(), 0); // default reserve = 0
    }

    // ====================================================== V1 recognition
    function test_claimV1_validProof() public {
        vm.expectEmit(true, false, false, false);
        emit V1MembershipRecognized(v1A);
        vm.prank(v1A);
        sale.claimV1Membership(_proof2(v1B));
        assertTrue(sale.knownMember(v1A));
    }

    function test_claimV1_alreadyKnownReverts() public {
        vm.prank(v1A);
        sale.claimV1Membership(_proof2(v1B));
        vm.prank(v1A);
        vm.expectRevert(SyndicateSaleV2.AlreadyKnown.selector);
        sale.claimV1Membership(_proof2(v1B));
    }

    function test_claimV1_invalidProofReverts() public {
        address stranger = makeAddr("stranger");
        vm.prank(stranger);
        vm.expectRevert(SyndicateSaleV2.InvalidProof.selector);
        sale.claimV1Membership(_proof2(v1B)); // not a member
    }

    function test_buy_v1WithProof_noNewSeat() public {
        _approve(sale, v1A, USDC_100);
        vm.expectEmit(true, false, false, false);
        emit V1MembershipRecognized(v1A);
        _buy(sale, v1A, USDC_10, address(0), _proof2(v1B));
        // recognized => NO new seat, member count unchanged, no assigned number
        assertEq(sale.memberCount(), GEN);
        assertEq(sale.memberNumberOf(v1A), 0);
        assertTrue(sale.knownMember(v1A));
        assertGt(syn.balanceOf(v1A), 0); // still receives SYN
    }

    function test_buy_v1WithoutProof_getsSeat_M2() public {
        // KNOWN DEBT M2: a V1 member who omits the proof is double-counted.
        _approve(sale, v1A, USDC_100);
        _buy(sale, v1A, USDC_10, address(0), _noProof());
        assertEq(sale.memberCount(), GEN + 1, "M2: new seat issued without proof");
        assertEq(sale.memberNumberOf(v1A), GEN + 1);
    }

    // ================================================================ pause
    function test_pause_blocksBuy() public {
        sale.pause();
        assertGt(sale.pausedAt(), 0);
        address p = makeAddr("p");
        _approve(sale, p, USDC_100);
        vm.prank(p);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        sale.buy(USDC_10, address(0), 0, _noProof());

        sale.unpause();
        assertEq(sale.pausedAt(), 0);
        _buy(sale, p, USDC_10, address(0), _noProof());
        assertEq(sale.memberCount(), GEN + 1);
    }

    function test_pause_onlyOwner() public {
        vm.prank(makeAddr("notOwner"));
        vm.expectRevert();
        sale.pause();
    }

    // ============================================================== recovery
    function test_recover_notWindingDownReverts() public {
        vm.expectRevert(SyndicateSaleV2.NotWindingDown.selector);
        sale.recoverUnsoldSyn();
    }

    function test_recover_timelockedThenSucceeds() public {
        sale.pause();
        uint256 readyAt = uint256(sale.pausedAt()) + sale.RECOVERY_TIMELOCK();
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.RecoveryTimelocked.selector, readyAt));
        sale.recoverUnsoldSyn();

        vm.warp(readyAt);
        uint256 bal = syn.balanceOf(address(sale));
        vm.expectEmit(true, false, false, true);
        emit UnsoldSynRecovered(vault, bal);
        sale.recoverUnsoldSyn();
        assertEq(syn.balanceOf(vault), bal);
        assertEq(syn.balanceOf(address(sale)), 0);
    }

    function test_rescueToken_protectedReverts() public {
        vm.expectRevert(SyndicateSaleV2.ProtectedToken.selector);
        sale.rescueToken(address(usdc));
        vm.expectRevert(SyndicateSaleV2.ProtectedToken.selector);
        sale.rescueToken(address(syn));
    }

    function test_rescueToken_otherToVault() public {
        MockERC20 other = new MockERC20("Other", "OTH", 18);
        other.mint(address(sale), 1234);
        sale.rescueToken(address(other));
        assertEq(other.balanceOf(vault), 1234);
    }

    // ============================================================ router glue
    function test_router_fallbackOnRevert() public {
        RevertingRouter rr = new RevertingRouter();
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(rr), root);
        syn.mint(address(s), FUND);
        address a = makeAddr("fb");
        _approve(s, a, USDC_100);

        vm.expectEmit(true, false, false, true);
        emit CommissionRouterFallback(GEN + 1, 10_000_000);
        _buy(s, a, USDC_100, address(0), _noProof());
        // full ops slice to OPERATIONS (no referral)
        assertEq(usdc.balanceOf(operations), 10_000_000);
        assertEq(usdc.balanceOf(address(s)), 0);
    }

    function test_router_integrationReferralPaid() public {
        CommissionRouterV1 r = new CommissionRouterV1(address(usdc));
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(r), root);
        syn.mint(address(s), FUND);
        // honor M1: router forwards Operations remainder to the sale's OPERATIONS
        r.addSource(address(s), keccak256("SALE_V2"), operations);

        // v1A becomes a known member (referrer) without buying
        vm.prank(v1A);
        s.claimV1Membership(_proof2(v1B));

        address buyer = makeAddr("ibuyer");
        _approve(s, buyer, USDC_100);
        _buy(s, buyer, USDC_100, v1A, _noProof());

        // ops slice 10e6: Signal tier 30% to referrer, 70% to OPERATIONS
        assertEq(usdc.balanceOf(v1A), 3_000_000, "referrer 30% of ops");
        assertEq(usdc.balanceOf(operations), 7_000_000, "ops remainder");
        assertEq(usdc.balanceOf(vault), 70_000_000);
        assertEq(usdc.balanceOf(liquidity), 20_000_000);
        assertEq(r.referredCount(v1A), 1);
        assertEq(usdc.balanceOf(address(s)), 0);
    }

    function test_router_proposeConfirmTimelock() public {
        address newRouter = address(new RevertingRouter());
        sale.proposeCommissionRouter(newRouter);
        assertEq(sale.pendingCommissionRouter(), newRouter);

        vm.expectRevert(
            abi.encodeWithSelector(SyndicateSaleV2.RouterTimelocked.selector, sale.commissionRouterReadyAt())
        );
        sale.confirmCommissionRouter();

        vm.warp(sale.commissionRouterReadyAt());
        sale.confirmCommissionRouter();
        assertEq(sale.commissionRouter(), newRouter);
        assertEq(usdc.allowance(address(sale), newRouter), type(uint256).max);

        sale.disableCommissionRouter();
        assertEq(sale.commissionRouter(), address(0));
        assertEq(usdc.allowance(address(sale), newRouter), 0);
    }

    function test_router_proposeZeroReverts() public {
        vm.expectRevert(SyndicateSaleV2.ZeroAddress.selector);
        sale.proposeCommissionRouter(address(0));
    }

    function test_reentrancy_buyBlocked() public {
        ReentrantRouter rr = new ReentrantRouter();
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(rr), root);
        rr.setSale(address(s));
        syn.mint(address(s), FUND);

        address a = makeAddr("re");
        _approve(s, a, USDC_100);
        // reentry reverts inside route() -> caught -> fallback (ops to OPERATIONS)
        vm.expectEmit(true, false, false, true);
        emit CommissionRouterFallback(GEN + 1, 10_000_000);
        _buy(s, a, USDC_100, address(0), _noProof());
        // exactly ONE seat issued (the reentrant nested buy did not execute)
        assertEq(s.memberCount(), GEN + 1);
        assertEq(usdc.balanceOf(operations), 10_000_000);
    }

    // ================================================================== fuzz
    function testFuzz_splitConservation(uint256 raw) public {
        uint256 usdcIn = bound(raw, USDC_10, MAXTX);
        address a = makeAddr("fuzz");
        _approve(sale, a, usdcIn);
        _buy(sale, a, usdcIn, address(0), _noProof());

        uint256 v = (usdcIn * 70) / 100;
        uint256 l = (usdcIn * 20) / 100;
        uint256 o = usdcIn - v - l;
        assertEq(usdc.balanceOf(vault), v);
        assertEq(usdc.balanceOf(liquidity), l);
        assertEq(usdc.balanceOf(operations), o);
        assertEq(v + l + o, usdcIn, "splits reconstruct gross");
        assertEq(usdc.balanceOf(address(sale)), 0, "balance returns to 0");
    }
}
