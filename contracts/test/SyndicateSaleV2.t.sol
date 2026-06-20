// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
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
    uint256 internal constant USDC_5 = 5_000_000;     // $5 (Era I / Genesis minimum)
    uint256 internal constant GEN_MIN_ENTRY = 5e20;   // $5 * 100 * 1e12 = 500 SYN

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

    // Model 2 caps. NOTE: Genesis (Era I) is RANGE-bounded; the constructor forces
    // its aggregate SYN cap NON-BINDING (type(uint256).max), so eraCaps[0] is
    // IGNORED under Model 2 (a deploy may pass 0, like _eraCaps()). This helper
    // keeps a non-zero c[0] only to prove that any value is accepted-and-ignored.
    function _eraCapsGen() internal pure returns (uint256[9] memory c) {
        c[0] = 208_125e18;
        for (uint256 i = 1; i < 9; ++i) c[i] = 1e30;
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

    function _uniqueBuyer(string memory salt, uint256 i) internal pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(salt, i)))));
    }

    function _seedReferralCount(SyndicateSaleV2 s, address ref, uint256 start, uint256 count) internal {
        for (uint256 i = 0; i < count; ++i) {
            address buyerSeed = _uniqueBuyer("tier-seed", start + i);
            _approve(s, buyerSeed, USDC_10);
            _buy(s, buyerSeed, USDC_10, ref, _noProof());
        }
    }

    function _assertNextReferralPct(
        SyndicateSaleV2 s,
        address ref,
        uint256 buyerSalt,
        uint256 expectedOpsPct
    ) internal {
        address buyerNext = _uniqueBuyer("tier-assert", buyerSalt);
        uint256 refBefore = usdc.balanceOf(ref);
        uint256 opsBefore = usdc.balanceOf(operations);
        _approve(s, buyerNext, USDC_100);
        _buy(s, buyerNext, USDC_100, ref, _noProof());

        uint256 opsSlice = 10_000_000;
        uint256 expectedRef = (opsSlice * expectedOpsPct) / 100;
        assertEq(usdc.balanceOf(ref) - refBefore, expectedRef, "tier referrer amount");
        assertEq(usdc.balanceOf(operations) - opsBefore, opsSlice - expectedRef, "tier ops remainder");
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
        // Model 2: the lower 333 floor is REMOVED; the only invalid genesisOffset
        // is >= FINAL_SEAT (the sale would already be concluded). 332 now DEPLOYS
        // (see test_ctor_genesisOffsetModel2_valid).
        vm.expectRevert(SyndicateSaleV2.BadGenesisOffset.selector);
        _deploy(1_000_000, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root); // >= FINAL
    }

    function test_ctor_genesisOffsetModel2_valid() public {
        // Below the Genesis ceiling now DEPLOYS and starts in Era I (Model 2).
        SyndicateSaleV2 s0 = _deploy(0, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        assertEq(s0.GENESIS_OFFSET(), 0);
        assertEq(s0.memberCount(), 0);
        assertEq(s0.activeEra(), 1, "genesisOffset 0 => first seat is Genesis");

        SyndicateSaleV2 s2 = _deploy(2, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        assertEq(s2.GENESIS_OFFSET(), 2);
        assertEq(s2.memberCount(), 2);
        assertEq(s2.activeEra(), 1, "genesisOffset 2 => next seat #3 is Genesis");

        SyndicateSaleV2 s332 = _deploy(332, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        assertEq(s332.activeEra(), 1, "seat #333 is still Genesis");

        SyndicateSaleV2 s333 = _deploy(333, _addrCaps(), MAXTX, 0, _eraCaps(), address(0), root);
        assertEq(s333.activeEra(), 2, "seat #334 is Era II (unchanged)");
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

    function test_router_integrationAllTiersFromOperationsOnly() public {
        CommissionRouterV1 r = new CommissionRouterV1(address(usdc));
        SyndicateSaleV2 s = _deploy(GEN, _addrCaps(), MAXTX, 0, _eraCaps(), address(r), root);
        syn.mint(address(s), FUND);
        r.addSource(address(s), keccak256("SALE_V2"), operations);

        vm.prank(v1A);
        s.claimV1Membership(_proof2(v1B));

        _assertNextReferralPct(s, v1A, 0, 30);
        assertEq(r.referredCount(v1A), 1);

        _seedReferralCount(s, v1A, 0, 4);
        assertEq(r.referredCount(v1A), 5);
        _assertNextReferralPct(s, v1A, 5, 40);

        _seedReferralCount(s, v1A, 4, 14);
        assertEq(r.referredCount(v1A), 20);
        _assertNextReferralPct(s, v1A, 20, 55);

        _seedReferralCount(s, v1A, 18, 29);
        assertEq(r.referredCount(v1A), 50);
        _assertNextReferralPct(s, v1A, 50, 70);

        _seedReferralCount(s, v1A, 47, 49);
        assertEq(r.referredCount(v1A), 100);
        _assertNextReferralPct(s, v1A, 100, 80);

        uint256 totalGross = (5 * USDC_100) + (96 * USDC_10);
        assertEq(usdc.balanceOf(vault), (totalGross * 70) / 100, "vault always receives full 70%");
        assertEq(usdc.balanceOf(liquidity), (totalGross * 20) / 100, "liquidity always receives full 20%");
        assertEq(usdc.balanceOf(address(s)), 0, "sale retains no USDC");
        assertEq(usdc.balanceOf(address(r)), 0, "router retains no USDC without escrow");
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

    // ============================================== Model 2 (Genesis V2 sale)
    function test_model2_genesisOffset2_firstBuyerGetsSeat3_eraI() public {
        SyndicateSaleV2 s = _deploy(2, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);

        // Era I quote: 100 SYN/USDC, next seat #3.
        (uint256 q, uint16 era, uint64 spu, uint256 seatIfFirst,,) = s.quote(USDC_5);
        assertEq(era, 1, "Era I (Genesis)");
        assertEq(spu, 100, "100 SYN/USDC");
        assertEq(q, GEN_MIN_ENTRY, "$5 => 500 SYN");
        assertEq(seatIfFirst, 3, "first V2 seat is #3");

        address a = makeAddr("g2a");
        _approve(s, a, USDC_5);
        _buy(s, a, USDC_5, address(0), _noProof());
        assertEq(s.memberCount(), 3, "first V2 buyer is member #3");
        assertEq(s.memberNumberOf(a), 3);
        assertEq(syn.balanceOf(a), GEN_MIN_ENTRY, "Era I buy fills at 100 SYN/USDC");
        assertEq(s.soldInEra(1), GEN_MIN_ENTRY, "Genesis era cap consumed");
        assertEq(s.activeEra(), 1, "still Genesis");
    }

    function test_model2_genesisOffset0_firstSeatIsOne() public {
        SyndicateSaleV2 s = _deploy(0, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);
        assertEq(s.memberCount(), 0);
        assertEq(s.currentEra(), 1, "Genesis from seat #1");

        address a = makeAddr("g0a");
        _approve(s, a, USDC_5);
        _buy(s, a, USDC_5, address(0), _noProof());
        assertEq(s.memberCount(), 1, "first ever seat is #1");
        assertEq(s.memberNumberOf(a), 1);
        assertEq(syn.balanceOf(a), GEN_MIN_ENTRY);
    }

    function test_model2_eraIaddrCapApplies() public {
        // default a[0] = $5 (Era I min == cap): a 2nd buy by the same wallet exceeds
        // the per-address Era I cap.
        SyndicateSaleV2 s = _deploy(2, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);
        address a = makeAddr("g2cap");
        _approve(s, a, USDC_100);
        _buy(s, a, USDC_5, address(0), _noProof()); // $5 hits the $5 cap exactly
        vm.prank(a);
        vm.expectRevert(abi.encodeWithSelector(SyndicateSaleV2.AddressEraCapExceeded.selector, 0));
        s.buy(USDC_5, address(0), 0, _noProof());
    }

    function test_model2_eraI_aggregateCapDoesNotBind() public {
        // MODEL 2 invariant: Genesis (Era I) is RANGE-bounded, NOT SYN-cap-bounded.
        // Even with eraCaps[0] set to a single tiny Genesis entry, a larger Era I
        // buy must SUCCEED (no EraInventoryInsufficient) and must NOT advance the
        // era — the aggregate cap is non-binding for Genesis (eraCaps[0] ignored).
        uint256[9] memory a = _addrCaps();
        a[0] = 20_000_000; // $20 per-address room
        uint256[9] memory c = _eraCapsGen();
        c[0] = GEN_MIN_ENTRY; // deliberately tiny: exactly one $5 Genesis entry
        SyndicateSaleV2 s = _deploy(2, a, MAXTX, 0, c, address(0), root);
        syn.mint(address(s), FUND);
        address g = makeAddr("g2eracap");
        _approve(s, g, USDC_100);
        _buy(s, g, USDC_20, address(0), _noProof()); // $20 => 2000 SYN, far over the tiny cap
        assertEq(syn.balanceOf(g), USDC_20 * 100 * 1e12, "Era I fills at 100 SYN/USDC despite tiny eraCaps[0]");
        assertEq(s.activeEra(), 1, "Genesis does NOT advance by cap");
        assertEq(s.memberCount(), 3, "Genesis seat still issued");
    }

    function test_model2_eraI_capExhaustionDoesNotAdvanceBefore334() public {
        // REGRESSION (architect HIGH): repeat buys grow soldInEra[1] WITHOUT
        // advancing memberCount. With a finite Genesis cap this would have
        // cap-advanced to Era II BEFORE seat #334, mispricing Genesis seats. Under
        // the fix (Genesis range-bounded), the era stays I until #334 no matter how
        // much SYN is sold in Genesis via repeats.
        uint256[9] memory a = _addrCaps();
        a[0] = 100_000_000; // $100 per-address room => many repeats per wallet
        uint256[9] memory c = _eraCapsGen();
        c[0] = GEN_MIN_ENTRY; // tiny finite cap (would exhaust almost immediately pre-fix)
        SyndicateSaleV2 s = _deploy(330, a, MAXTX, 0, c, address(0), root);
        syn.mint(address(s), FUND);

        // One wallet hammers Genesis with repeat buys (no new seats after the
        // first), piling soldInEra[1] far past the tiny eraCaps[0].
        address whale = makeAddr("g330whale");
        _approve(s, whale, USDC_100);
        for (uint256 i = 0; i < 10; ++i) {
            _buy(s, whale, USDC_5, address(0), _noProof()); // $5 each => 500 SYN each
        }
        assertEq(s.memberCount(), 331, "whale took ONE Genesis seat (#331); repeats add none");
        assertGt(s.soldInEra(1), c[0], "soldInEra[1] is far past the tiny finite cap");
        assertEq(s.activeEra(), 1, "Genesis did NOT advance by cap");

        // Genesis seats #332, #333 still price at Era I.
        address a332 = makeAddr("seat332b");
        _approve(s, a332, USDC_5);
        _buy(s, a332, USDC_5, address(0), _noProof());
        assertEq(s.memberCount(), 332);
        assertEq(syn.balanceOf(a332), GEN_MIN_ENTRY, "Era I pricing at #332");
        assertEq(s.activeEra(), 1);

        address a333 = makeAddr("seat333b");
        _approve(s, a333, USDC_5);
        _buy(s, a333, USDC_5, address(0), _noProof());
        assertEq(s.memberCount(), 333);
        assertEq(s.activeEra(), 1, "still Genesis at #333");

        // Seat #334 opens Era II by RANGE — exactly as the invariant requires.
        address a334 = makeAddr("seat334b");
        _approve(s, a334, USDC_10);
        vm.expectEmit(true, true, false, true);
        emit EraAdvanced(1, 2, 334, 0); // REASON_RANGE
        _buy(s, a334, USDC_10, address(0), _noProof());
        assertEq(s.memberCount(), 334);
        assertEq(s.activeEra(), 2, "Era II opens at #334, never before");
        assertEq(syn.balanceOf(a334), USDC_10 * 50 * 1e12, "Era II = 50 SYN/USDC");
    }

    function test_model2_eraCaps0Zero_acceptedAndIgnored() public {
        // Under Model 2, eraCaps[0] is IGNORED (Genesis range-bounded), so the SAME
        // zero value used on the recommended pause-at-333 path is valid here — the
        // pre-fix constructor would have reverted BadEraCaps on c[0] < min entry.
        uint256[9] memory c = _eraCaps(); // c[0] = 0
        SyndicateSaleV2 s = _deploy(2, _addrCaps(), MAXTX, 0, c, address(0), root);
        syn.mint(address(s), FUND);
        assertEq(s.activeEra(), 1, "deploys in Genesis with eraCaps[0] = 0");
        assertEq(s.eraSynCap(1), type(uint256).max, "Genesis aggregate cap is non-binding");

        address a = makeAddr("g2zero");
        _approve(s, a, USDC_5);
        _buy(s, a, USDC_5, address(0), _noProof());
        assertEq(s.memberCount(), 3, "Genesis seat issued");
        assertEq(syn.balanceOf(a), GEN_MIN_ENTRY, "Era I pricing");
    }

    function test_model2_autoAdvanceToEraIIatSeat334() public {
        // genesisOffset 332 => next seat #333 (Genesis); seat #334 opens Era II by RANGE.
        SyndicateSaleV2 s = _deploy(332, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);

        address a1 = makeAddr("seat333");
        _approve(s, a1, USDC_5);
        _buy(s, a1, USDC_5, address(0), _noProof()); // seat #333, Genesis
        assertEq(s.memberCount(), 333);
        assertEq(s.activeEra(), 1, "still Genesis at #333");
        assertEq(syn.balanceOf(a1), GEN_MIN_ENTRY, "100 SYN/USDC in Genesis");
        assertEq(s.currentEra(), 2, "view rolls to Era II once the range is filled");

        address a2 = makeAddr("seat334");
        _approve(s, a2, USDC_10);
        vm.expectEmit(true, true, false, true);
        emit EraAdvanced(1, 2, 334, 0); // REASON_RANGE, opens at seat #334
        _buy(s, a2, USDC_10, address(0), _noProof()); // seat #334, Era II
        assertEq(s.activeEra(), 2);
        assertEq(s.memberCount(), 334);
        assertEq(syn.balanceOf(a2), USDC_10 * 50 * 1e12, "Era II = 50 SYN/USDC");
    }

    function test_model2_reserveFloorIncludesGenesisSeats() public {
        // genesisOffset 2 + reserveThroughSeat 10,000: the floor must also reserve
        // the remaining Genesis seats (#3..#333) -> strictly MORE than the 333-handoff
        // floor (which only reserves Era II..IV).
        SyndicateSaleV2 s2 = _deploy(2, _addrCaps(), MAXTX, 10_000, _eraCapsGen(), address(0), root);
        SyndicateSaleV2 s333 = _deploy(333, _addrCaps(), MAXTX, 10_000, _eraCaps(), address(0), root);
        assertEq(s2.currentReserveFloor(), 4_099_000e18, "incl. Genesis #3..#333");
        assertEq(s333.currentReserveFloor(), 3_933_500e18, "Era II..IV only");
        assertGt(s2.currentReserveFloor(), s333.currentReserveFloor());
    }

    function test_model2_repeatBuyerNoSeatIncrement_eraI() public {
        uint256[9] memory a = _addrCaps();
        a[0] = 15_000_000; // $15 lets one wallet buy in Genesis more than once
        SyndicateSaleV2 s = _deploy(2, a, MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);
        address r = makeAddr("g2repeat");
        _approve(s, r, USDC_100);
        _buy(s, r, USDC_5, address(0), _noProof()); // seat #3
        assertEq(s.memberCount(), 3);
        _buy(s, r, USDC_5, address(0), _noProof()); // repeat: NO new seat
        assertEq(s.memberCount(), 3, "repeat buyer issues no new seat");
        assertEq(s.memberNumberOf(r), 3, "seat number unchanged");
        assertEq(syn.balanceOf(r), GEN_MIN_ENTRY * 2, "still receives SYN both times");
    }

    function test_model2_v1ProofFlow_eraI_noNewSeat() public {
        // V1 proof recognition still works while V2 is selling Genesis.
        SyndicateSaleV2 s = _deploy(2, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(0), root);
        syn.mint(address(s), FUND);
        _approve(s, v1A, USDC_5);
        vm.expectEmit(true, false, false, false);
        emit V1MembershipRecognized(v1A);
        _buy(s, v1A, USDC_5, address(0), _proof2(v1B));
        assertEq(s.memberCount(), 2, "recognized V1 member: no new Genesis seat");
        assertEq(s.memberNumberOf(v1A), 0);
        assertTrue(s.knownMember(v1A));
        assertGt(syn.balanceOf(v1A), 0);
    }

    function test_model2_referralPinnedToZero_eraI_emitsAttributionZeroPayout() public {
        // Router SET, referrer pinned to address(0): route() still runs, pays the
        // referrer NOTHING, forwards the FULL Operations slice, and emits Attribution.
        CommissionRouterV1 r = new CommissionRouterV1(address(usdc));
        SyndicateSaleV2 s = _deploy(2, _addrCaps(), MAXTX, 0, _eraCapsGen(), address(r), root);
        syn.mint(address(s), FUND);
        r.addSource(address(s), keccak256("SALE_V2"), operations);

        address buyer = makeAddr("g2pin");
        _approve(s, buyer, USDC_5);

        vm.recordLogs();
        _buy(s, buyer, USDC_5, address(0), _noProof());
        Vm.Log[] memory logs = vm.getRecordedLogs();

        bytes32 sig = keccak256(
            "Attribution(bytes32,address,address,bytes32,bytes32,address,uint256,uint16,uint256[5],uint8,uint8)"
        );
        bool found;
        for (uint256 i = 0; i < logs.length; ++i) {
            if (logs[i].topics[0] == sig) {
                found = true;
                assertEq(logs[i].topics[3], bytes32(0), "Attribution referrer is zero");
            }
        }
        assertTrue(found, "router emitted Attribution");

        // Zero referrer payout: full ops slice (10% of $5 = $0.5) to OPERATIONS.
        assertEq(usdc.balanceOf(operations), 500_000, "full ops slice; referrer paid nothing");
        assertEq(r.referredCount(address(0)), 0);
        assertEq(s.memberCount(), 3, "buyer still seated #3");
    }
}
