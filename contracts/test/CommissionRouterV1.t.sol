// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {CommissionRouterV1, CommissionRouteInput} from "../src/CommissionRouterV1.sol";
import {BlocklistERC20} from "./mocks/Tokens.sol";
import {MockSource} from "./mocks/SourceMock.sol";

/// @title  CommissionRouterV1 unit tests
/// @notice Covers tier ladder + boundaries, Operations-only carve, split
///         conservation, the H4 integrity guard, source allow-list, push/escrow
///         (H5) + claim, first-seat-only counting, and full RAL reconstruction.
contract CommissionRouterV1Test is Test {
    BlocklistERC20 internal usdc;        // 6dp, blocklist-capable (acts as real USDC)
    CommissionRouterV1 internal router;
    MockSource internal source;          // the allow-listed "sale"

    address internal opsWallet = makeAddr("opsWallet");
    address internal buyer     = makeAddr("buyer");
    address internal referrer  = makeAddr("referrer");
    bytes32 internal constant SOURCE_ID = keccak256("SALE_V2");

    uint256 internal constant GROSS = 100_000_000; // $100 (6dp)
    uint256 internal constant VAULT = 70_000_000;  // 70%
    uint256 internal constant LIQ   = 20_000_000;  // 20%
    uint256 internal constant OPS   = 10_000_000;  // 10%

    // mirror of the contract's event for expectEmit
    event Attribution(
        bytes32 indexed source,
        address indexed buyer,
        address indexed referrer,
        bytes32 campaign,
        bytes32 refTag,
        address token,
        uint256 gross,
        uint16  tier,
        uint256[5] splits,
        uint8   paymentMode,
        uint8   attributionMode
    );
    event ReferralEscrowed(address indexed referrer, uint256 amount);
    event ReferralClaimed(address indexed referrer, uint256 amount);

    function setUp() public {
        usdc = new BlocklistERC20("USD Coin", "USDC", 6);
        router = new CommissionRouterV1(address(usdc)); // owner = this
        source = new MockSource();
        router.addSource(address(source), SOURCE_ID, opsWallet);

        // fund the source generously and let the router pull from it
        usdc.mint(address(source), 1_000_000_000_000); // $1,000,000
        source.approveRouter(usdc, address(router), type(uint256).max);
        source.setKnown(referrer, true);
    }

    // ---------------------------------------------------------------- helpers
    function _input(address b, address r, uint256 gross, bool firstSeat)
        internal
        pure
        returns (CommissionRouteInput memory p)
    {
        uint256 vault = (gross * 70) / 100;
        uint256 liq = (gross * 20) / 100;
        uint256 ops = gross - vault - liq;
        p = CommissionRouteInput({
            buyer: b,
            referrer: r,
            gross: gross,
            vaultAmount: vault,
            liquidityAmount: liq,
            opsSlice: ops,
            firstSeat: firstSeat,
            campaign: bytes32(0),
            refTag: bytes32(0)
        });
    }

    // ============================================================= governance
    function test_addSource_onlyOwner() public {
        vm.prank(buyer);
        vm.expectRevert(); // Ownable: caller is not the owner
        router.addSource(address(0xBEEF), "X", opsWallet);
    }

    function test_addSource_zeroReverts() public {
        vm.expectRevert(CommissionRouterV1.ZeroAddress.selector);
        router.addSource(address(0), "X", opsWallet);
        vm.expectRevert(CommissionRouterV1.ZeroAddress.selector);
        router.addSource(address(0xBEEF), "X", address(0));
    }

    function test_addSource_existsReverts() public {
        vm.expectRevert(CommissionRouterV1.SourceExists.selector);
        router.addSource(address(source), SOURCE_ID, opsWallet);
    }

    function test_removeSource() public {
        router.removeSource(address(source));
        (bool enabled,,) = router.sourceConfig(address(source));
        assertFalse(enabled);
        vm.expectRevert(CommissionRouterV1.UnknownSource.selector);
        router.removeSource(address(source));
    }

    function test_route_notAuthorizedSource() public {
        // calling route directly (not via an allow-listed source) reverts
        CommissionRouteInput memory p = _input(buyer, address(0), GROSS, true);
        vm.expectRevert(CommissionRouterV1.NotAuthorizedSource.selector);
        router.route(p);
    }

    // ============================================================== integrity
    function test_route_splitMismatchReverts() public {
        CommissionRouteInput memory p = _input(buyer, referrer, GROSS, true);
        p.vaultAmount += 1; // break vault+liq+ops == gross
        vm.expectRevert(CommissionRouterV1.SplitMismatch.selector);
        source.doRoute(router, p);
    }

    // ========================================================= referral logic
    function test_route_noReferrer_allToOps() public {
        CommissionRouteInput memory p = _input(buyer, address(0), GROSS, true);
        (uint256 ref, uint256 ops) = source.doRoute(router, p);
        assertEq(ref, 0);
        assertEq(ops, OPS);
        assertEq(usdc.balanceOf(opsWallet), OPS);
        assertEq(usdc.balanceOf(address(router)), 0);
        assertEq(router.referredCount(referrer), 0);
    }

    function test_route_selfReferral_ignored() public {
        // referrer == buyer => invalid
        CommissionRouteInput memory p = _input(referrer, referrer, GROSS, true);
        (uint256 ref, uint256 ops) = source.doRoute(router, p);
        assertEq(ref, 0);
        assertEq(ops, OPS);
        assertEq(router.referredCount(referrer), 0);
    }

    function test_route_unknownReferrer_ignored() public {
        address stranger = makeAddr("stranger"); // not setKnown
        CommissionRouteInput memory p = _input(buyer, stranger, GROSS, true);
        (uint256 ref, uint256 ops) = source.doRoute(router, p);
        assertEq(ref, 0);
        assertEq(ops, OPS);
    }

    function test_route_validReferral_signalTier() public {
        CommissionRouteInput memory p = _input(buyer, referrer, GROSS, true);
        (uint256 ref, uint256 ops) = source.doRoute(router, p);
        assertEq(ref, (OPS * 30) / 100, "Signal 30%");
        assertEq(ops, OPS - ref);
        assertEq(ref + ops, OPS, "no leakage");
        assertEq(usdc.balanceOf(referrer), ref);
        assertEq(usdc.balanceOf(opsWallet), ops);
        assertEq(usdc.balanceOf(address(router)), 0);
        assertEq(router.referredCount(referrer), 1, "first-seat increments");
    }

    function test_route_firstSeatOnly_count() public {
        // valid referral but NOT a first seat => paid, but count does NOT advance
        CommissionRouteInput memory p = _input(buyer, referrer, GROSS, false);
        (uint256 ref,) = source.doRoute(router, p);
        assertEq(ref, (OPS * 30) / 100, "still paid");
        assertEq(router.referredCount(referrer), 0, "no increment when !firstSeat");
    }

    function test_tierLadder_applies_afterFiveReferrals() public {
        // bump referredCount to 5 via five first-seat referrals
        for (uint256 i = 0; i < 5; ++i) {
            source.doRoute(router, _input(makeAddr(string(abi.encode("b", i))), referrer, GROSS, true));
        }
        assertEq(router.referredCount(referrer), 5);
        // now the next route should pay Advocate 40%
        (uint16 tier, uint16 opsPct, uint256 quoted) = router.quoteCommission(referrer, OPS);
        assertEq(tier, 1);
        assertEq(opsPct, 40);
        assertEq(quoted, (OPS * 40) / 100);
        (uint256 ref,) = source.doRoute(router, _input(buyer, referrer, GROSS, true));
        assertEq(ref, (OPS * 40) / 100, "Advocate 40% applied");
    }

    function test_tierFor_boundaries() public view {
        (uint16 t0, uint16 p0) = router.tierFor(0);
        (uint16 t4, uint16 p4) = router.tierFor(4);
        (uint16 t5, uint16 p5) = router.tierFor(5);
        (uint16 t19, uint16 p19) = router.tierFor(19);
        (uint16 t20, uint16 p20) = router.tierFor(20);
        (uint16 t49, uint16 p49) = router.tierFor(49);
        (uint16 t50, uint16 p50) = router.tierFor(50);
        (uint16 t99, uint16 p99) = router.tierFor(99);
        (uint16 t100, uint16 p100) = router.tierFor(100);
        assertEq(t0, 0);   assertEq(p0, 30);
        assertEq(t4, 0);   assertEq(p4, 30);
        assertEq(t5, 1);   assertEq(p5, 40);
        assertEq(t19, 1);  assertEq(p19, 40);
        assertEq(t20, 2);  assertEq(p20, 55);
        assertEq(t49, 2);  assertEq(p49, 55);
        assertEq(t50, 3);  assertEq(p50, 70);
        assertEq(t99, 3);  assertEq(p99, 70);
        assertEq(t100, 4); assertEq(p100, 80);
    }

    // ============================================================ push/escrow
    function test_escrow_onBlockedReferrer_thenClaim() public {
        usdc.setBlocked(referrer, true); // referrer cannot receive USDC
        CommissionRouteInput memory p = _input(buyer, referrer, GROSS, true);

        uint256 expectedRef = (OPS * 30) / 100;
        vm.expectEmit(true, false, false, true);
        emit ReferralEscrowed(referrer, expectedRef);
        (uint256 ref, uint256 ops) = source.doRoute(router, p);

        assertEq(ref, expectedRef, "attributed even though escrowed");
        assertEq(ops, OPS - expectedRef);
        assertEq(usdc.balanceOf(referrer), 0, "not pushed");
        assertEq(router.referralOwed(referrer), expectedRef, "escrowed");
        assertEq(usdc.balanceOf(address(router)), expectedRef, "router holds escrow");
        assertEq(usdc.balanceOf(opsWallet), ops, "ops remainder still forwarded");

        // claim after being unblocked
        usdc.setBlocked(referrer, false);
        vm.expectEmit(true, false, false, true);
        emit ReferralClaimed(referrer, expectedRef);
        vm.prank(referrer);
        router.claimReferral();
        assertEq(usdc.balanceOf(referrer), expectedRef);
        assertEq(router.referralOwed(referrer), 0);
        assertEq(usdc.balanceOf(address(router)), 0);
    }

    function test_claimReferral_nothingReverts() public {
        vm.prank(referrer);
        vm.expectRevert(CommissionRouterV1.NothingToClaim.selector);
        router.claimReferral();
    }

    function test_claimReferral_doubleClaimReverts() public {
        usdc.setBlocked(referrer, true);
        source.doRoute(router, _input(buyer, referrer, GROSS, true));
        usdc.setBlocked(referrer, false);
        vm.prank(referrer);
        router.claimReferral();
        // second claim has nothing left (effects-before-interactions)
        vm.prank(referrer);
        vm.expectRevert(CommissionRouterV1.NothingToClaim.selector);
        router.claimReferral();
    }

    function test_pushReferral_onlySelf() public {
        vm.expectRevert(CommissionRouterV1.OnlySelf.selector);
        router.pushReferral(referrer, 1);
    }

    // ====================================================== full RAL event
    function test_attribution_fullReconstruction() public {
        CommissionRouteInput memory p = _input(buyer, referrer, GROSS, true);
        uint256 expectedRef = (OPS * 30) / 100;
        uint256 expectedOps = OPS - expectedRef;
        uint256[5] memory splits;
        splits[0] = VAULT;
        splits[1] = LIQ;
        splits[2] = expectedRef;
        splits[3] = expectedOps;
        splits[4] = 0;

        vm.expectEmit(true, true, true, true);
        emit Attribution(
            SOURCE_ID,
            buyer,
            referrer,
            bytes32(0),
            bytes32(0),
            address(usdc),
            GROSS,
            0,            // Signal tier
            splits,
            0,            // MODE_PUSH
            0             // ATTR_LAST_VERIFIED
        );
        source.doRoute(router, p);

        // splits reconstruct gross
        assertEq(splits[0] + splits[1] + splits[2] + splits[3] + splits[4], GROSS);
    }

    function test_sourceConfig() public view {
        (bool enabled, bytes32 id, address ow) = router.sourceConfig(address(source));
        assertTrue(enabled);
        assertEq(id, SOURCE_ID);
        assertEq(ow, opsWallet);
    }

    // ===================================================================== fuzz
    /// referrer + operations ALWAYS reconstruct the Operations slice, ∀ slice/count
    function testFuzz_referrerPlusOps_eqOpsSlice(uint96 opsSlice, uint256 count) public view {
        (, uint16 opsPct) = router.tierFor(count);
        uint256 ref = (uint256(opsSlice) * opsPct) / 100;
        uint256 ops = uint256(opsSlice) - ref;
        assertEq(ref + ops, uint256(opsSlice));
        assertLe(ref, uint256(opsSlice)); // max tier 80% < 100%
    }

    /// end-to-end balance conservation through route(): nothing sticks to the router
    function testFuzz_route_conservation(uint96 grossRaw) public {
        uint256 gross = uint256(grossRaw);
        vm.assume(gross >= 100 && gross <= 1_000_000_000_000);
        CommissionRouteInput memory p = _input(buyer, referrer, gross, true);
        uint256 ops = p.opsSlice;
        (uint256 ref, uint256 opsOut) = source.doRoute(router, p);
        assertEq(ref + opsOut, ops, "ref + ops == opsSlice");
        assertEq(usdc.balanceOf(address(router)), 0, "router retains nothing");
        assertEq(usdc.balanceOf(referrer) + usdc.balanceOf(opsWallet), ops, "fully distributed");
    }
}
