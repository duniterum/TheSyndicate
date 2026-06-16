// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {SyndicateSaleV2} from "../src/SyndicateSaleV2.sol";

interface IERC20Like {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

/// @title  Forked-mainnet deploy rehearsal for SyndicateSaleV2 — V2b parameter set
/// @notice REHEARSAL ONLY — no mainnet deploy, no funds, no V1/V2a touch. Deploys
///         the production contract on an Avalanche C-Chain fork using the EXACT
///         V2b values in script/deploy-params.v2b.rehearsal.json:
///           - genesisOffset = 5  (V1 ∪ V2a merged snapshot)
///           - v1MemberRoot  = 0xa1f2ed10…718c49  (recognizes ALL 5 prior members)
///           - addrCaps[0]   = $25,000  (Era I / Genesis cap; $5 V2a defect fixed)
///         and exercises:
///           A. constructor read-back (offset 5 ⇒ memberCount 5, next seat #6,
///              $25k Era I cap echoed, router=0, merged root)
///           B. a V2a member (merged #3) recognized via claimV1Membership ⇒ NO seat
///           C. a fresh newcomer's first buy mints member #6
///           D. a returning merged member (V1 #1) with a valid proof mints NO seat
///           E. HEADLINE: a $10,000 Genesis buy clears the new $25k cap and yields
///              1,000,000 SYN (the largest Genesis package) — the capability the
///              V2a $5 cap blocked.
///
///         Skips cleanly when AVAX_RPC is unset so the default `forge test` (no
///         network) is unaffected. Run:
///           AVAX_RPC=<rpc> forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
contract RehearsalForkV2bTest is Test {
    // --- real mainnet addresses (must match deploy-params.v2b.rehearsal.json) ---
    address constant USDC  = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address constant SYN   = 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170;
    address constant VAULT = 0x205DdC8921A4C60106930eE35e1F395c8D13f464;
    address constant LIQ   = 0xa9b072db8DcDbb470235204B69D37275d74a2e25;
    address constant OPS   = 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80;

    // --- MERGED V1 ∪ V2a snapshot (export-members-merged.mjs → gen-v1-root.mjs) ---
    // REHEARSAL snapshot at current head; FINAL must re-snapshot at the V2a pause block.
    bytes32 constant ROOT = 0xa1f2ed106c6d87372d99256765fcbad8c150441913d7bf0ea51908665f718c49;

    // merged member #1 (V1) and its 2-element proof
    address constant M1_V1 = 0x244531C571966f90f4849e03a507543d90f9C721;
    // merged member #3 (V2a) and its 3-element proof
    address constant M3_V2A = 0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0;

    uint256 constant GENESIS_OFFSET  = 5;
    uint256 constant MAX_USDC_PER_TX = 25_000_000_000;   // $25,000 (6dp)
    uint256 constant RESERVE_THROUGH = 10_000;
    uint256 constant ERA_I_MIN_USDC  = 5_000_000;        // $5 (6dp)
    uint256 constant ERA_I_SYN_OUT   = 500 ether;        // $5 * 100 SYN/USDC
    uint256 constant WHALE_USDC      = 10_000_000_000;   // $10,000 (6dp)
    uint256 constant WHALE_SYN_OUT   = 1_000_000 ether;  // $10,000 * 100 = largest Genesis package

    function _proofM1() internal pure returns (bytes32[] memory p) {
        p = new bytes32[](2);
        p[0] = 0x351be682d5731e02352dd7e4a84dc8f8af1cc8f58e62316caafc44159d441f39;
        p[1] = 0xef07f63cec6e120b7b02d379ff08ceed31056c89ee8812835b7dd2845d42d403;
    }

    function _proofM3() internal pure returns (bytes32[] memory p) {
        p = new bytes32[](3);
        p[0] = 0x0560ad24ad0d373632c2755d700b9c7aafd2d6040e3a829cf7930c77743ae4a7;
        p[1] = 0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484;
        p[2] = 0x929c81bdf7c84ce011276a5e2dc5a7e959b98f12f1c39751e024230249e92c59;
    }

    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 25_000_000_000;  // Era I (Genesis) $25,000  ← V2b: was $5 on V2a
        a[1] = 1_000_000_000;   // Era II   $1,000
        a[2] = 2_500_000_000;   // Era III  $2,500
        a[3] = 5_000_000_000;   // Era IV   $5,000
        a[4] = 10_000_000_000;  // Era V    $10,000
        a[5] = 15_000_000_000;  // Era VI   $15,000
        a[6] = 20_000_000_000;  // Era VII  $20,000
        a[7] = 25_000_000_000;  // Era VIII $25,000
        a[8] = 25_000_000_000;  // Era IX   $25,000
    }

    function _eraCaps() internal pure returns (uint256[9] memory c) {
        c[0] = 0;                 // Era I ignored (forced to type(uint256).max)
        c[1] = 416_875 ether;     // Era II   (Model B)
        c[2] = 1_166_500 ether;   // Era III
        c[3] = 3_333_500 ether;   // Era IV
        c[4] = 6_750_000 ether;   // Era V
        c[5] = 11_250_000 ether;  // Era VI
        c[6] = 15_000_000 ether;  // Era VII
        c[7] = 60_000_000 ether;  // Era VIII
        c[8] = 150_000_000 ether; // Era IX
    }

    function test_forkRehearsalV2b_fullFlow() public {
        string memory rpc = vm.envOr("AVAX_RPC", string(""));
        if (bytes(rpc).length == 0) {
            emit log("AVAX_RPC unset -> skipping V2b forked-mainnet rehearsal");
            vm.skip(true);
            return;
        }
        uint256 forkBlock = vm.envOr("AVAX_FORK_BLOCK", uint256(0));
        if (forkBlock > 0) {
            vm.createSelectFork(rpc, forkBlock);
        } else {
            vm.createSelectFork(rpc);
        }

        // -------------------------------------------------- deploy (this == owner)
        SyndicateSaleV2 sale = new SyndicateSaleV2(
            USDC, SYN, VAULT, LIQ, OPS,
            GENESIS_OFFSET, ROOT,
            _addrCaps(), MAX_USDC_PER_TX, RESERVE_THROUGH, _eraCaps(),
            address(0) // initialRouter — day-one no referral
        );
        console2.log("deployed V2b SyndicateSaleV2 at:", address(sale));

        // -------------------------------------------------- A. constructor read-back
        assertEq(sale.owner(), address(this), "owner == deployer");
        assertEq(sale.GENESIS_OFFSET(), GENESIS_OFFSET, "GENESIS_OFFSET == 5");
        assertEq(sale.memberCount(), GENESIS_OFFSET, "memberCount == 5 (all prior members)");
        assertEq(sale.commissionRouter(), address(0), "router disarmed");
        assertEq(sale.V1_MEMBER_ROOT(), ROOT, "merged v1 root");
        assertEq(sale.MAX_USDC_PER_TX(), MAX_USDC_PER_TX, "maxUsdcPerTx $25k");
        assertEq(sale.RESERVE_THROUGH_SEAT(), RESERVE_THROUGH, "reserveThroughSeat");
        assertEq(sale.maxUsdcPerAddressPerEra(1), 25_000_000_000, "Era I addr cap == $25,000 (V2a $5 defect fixed)");
        assertEq(sale.eraSynCap(1), type(uint256).max, "eraSynCap[1] forced to max (Model 2)");

        // -------------------------------------------------- B. Era I active for #6
        assertEq(sale.activeEra(), 1, "activeEra == 1 (Genesis)");
        assertEq(sale.currentEra(), 1, "currentEra == 1");
        assertEq(sale.nextSeatNumber(), 6, "next seat #6 (offset 5)");

        // fund the contract with SYN (separate post-deploy step in production)
        deal(SYN, address(sale), 50_000_000 ether);

        // -------------------------------------------------- B'. recognize V2a member #3
        vm.prank(M3_V2A);
        sale.claimV1Membership(_proofM3());
        assertTrue(sale.knownMember(M3_V2A), "V2a member #3 recognized via merged root");
        assertEq(sale.memberCount(), 5, "recognition mints NO seat");

        // -------------------------------------------------- C. fresh newcomer -> #6
        address newcomer = makeAddr("v2b-newcomer");
        deal(USDC, newcomer, 1_000_000_000); // $1,000
        bytes32[] memory noProof = new bytes32[](0);
        vm.startPrank(newcomer);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(ERA_I_MIN_USDC, address(0), 0, noProof);
        vm.stopPrank();
        assertEq(sale.memberCount(), 6, "fresh buy -> memberCount 6");
        assertEq(sale.memberNumberOf(newcomer), 6, "newcomer is member #6");
        assertEq(IERC20Like(SYN).balanceOf(newcomer), ERA_I_SYN_OUT, "newcomer got 500 SYN");

        // -------------------------------------------------- D. returning merged member -> NO 2nd seat
        uint256 m1SynBefore = IERC20Like(SYN).balanceOf(M1_V1);
        deal(USDC, M1_V1, 1_000_000_000);
        vm.startPrank(M1_V1);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(ERA_I_MIN_USDC, address(0), 0, _proofM1());
        vm.stopPrank();
        assertEq(sale.memberCount(), 6, "returning member mints NO second seat");
        assertEq(sale.memberNumberOf(M1_V1), 0, "merged member has no NEW V2b seat number");
        assertTrue(sale.knownMember(M1_V1), "merged member recognized");
        assertEq(IERC20Like(SYN).balanceOf(M1_V1) - m1SynBefore, ERA_I_SYN_OUT, "merged member still received SYN (delta)");

        // -------------------------------------------------- E. HEADLINE: $10,000 Genesis buy
        address whale = makeAddr("v2b-genesis-whale");
        deal(USDC, whale, WHALE_USDC);
        vm.startPrank(whale);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(WHALE_USDC, address(0), 0, noProof); // $10,000 — would REVERT under V2a's $5 cap
        vm.stopPrank();
        assertEq(sale.memberCount(), 7, "whale buy -> memberCount 7");
        assertEq(sale.memberNumberOf(whale), 7, "whale is member #7");
        assertEq(IERC20Like(SYN).balanceOf(whale), WHALE_SYN_OUT, "whale got 1,000,000 SYN (largest Genesis package)");

        console2.log("V2b FORK REHEARSAL OK: 5 prior members preserved, no duplicate seats, $10k Genesis buy = 1,000,000 SYN");
    }
}
