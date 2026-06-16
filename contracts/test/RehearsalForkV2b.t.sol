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
///         and proves, end-to-end:
///           A. constructor read-back (offset 5 ⇒ memberCount 5, next seat #6,
///              $25k Era I cap echoed, router=0, merged root, eraSynCap[1]=max)
///           B. a V2a member (merged #3) recognized via claimV1Membership ⇒ NO seat
///           C. a fresh newcomer's first buy mints member #6 ($5)
///           D. a returning merged member (V1 #1) with a valid proof mints NO seat
///           E. amount ladder $25/$100/$1,000/$10,000 all succeed ⇒ seats #7..#10,
///              each paying usdcIn * 100 SYN (Genesis rate)
///           F. 70/20/10 routing: a $1,000 buy moves +700/+200/+100 USDC to
///              Vault/Liquidity/Operations (CommissionRouter unset ⇒ full ops slice)
///           G. repeat purchase by an existing member adds SYN + cumulative USDC
///              recognition but mints NO second seat
///           H. CommissionRouter stays address(0) throughout
///
///         Skips cleanly when AVAX_RPC is unset so the default `forge test` (no
///         network) is unaffected. Run (cancun matches the live chain spec):
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

    // Genesis amount ladder (6dp USDC) and the SYN each yields at 100 SYN/USDC.
    uint256 constant USDC_5      = 5_000_000;             // $5
    uint256 constant USDC_25     = 25_000_000;            // $25
    uint256 constant USDC_100    = 100_000_000;           // $100
    uint256 constant USDC_1K     = 1_000_000_000;         // $1,000
    uint256 constant USDC_10K    = 10_000_000_000;        // $10,000
    uint256 constant SYN_5       = 500 ether;             // $5    * 100
    uint256 constant SYN_25      = 2_500 ether;           // $25   * 100
    uint256 constant SYN_100     = 10_000 ether;          // $100  * 100
    uint256 constant SYN_1K      = 100_000 ether;         // $1k   * 100
    uint256 constant SYN_10K     = 1_000_000 ether;       // $10k  * 100 (largest Genesis package)

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

    SyndicateSaleV2 internal sale;

    /// @dev fund `who` with USDC, max-approve the sale, buy `usdcIn` (no proof,
    ///      no referrer), return the SYN minted to `who` by this buy.
    function _buy(address who, uint256 usdcIn) internal returns (uint256 synDelta) {
        bytes32[] memory noProof = new bytes32[](0);
        uint256 before = IERC20Like(SYN).balanceOf(who);
        deal(USDC, who, usdcIn);
        vm.startPrank(who);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(usdcIn, address(0), 0, noProof);
        vm.stopPrank();
        synDelta = IERC20Like(SYN).balanceOf(who) - before;
    }

    /// @dev FAIL-CLOSED CONSTANT GUARD (runs with NO fork, so it executes on every
    ///      plain `forge test`). The merged-snapshot values below are mirrored in
    ///      the deploy params file Deploy.s.sol will use; assert they MATCH so this
    ///      rehearsal can NEVER pass against stale constants once the snapshot is
    ///      re-pinned to the V2a pause block. Point DEPLOY_PARAMS at the FINAL file
    ///      when rehearsing the final params; if ROOT/offset/Genesis-cap here drift
    ///      from that file the test reverts before any fork work, forcing the
    ///      operator to update these constants (and the proofs below) in lockstep.
    function test_rehearsalConstantsMatchDeployParams() public view {
        string memory paramsPath =
            vm.envOr("DEPLOY_PARAMS", string("script/deploy-params.v2b.rehearsal.json"));
        string memory pj = vm.readFile(paramsPath);
        assertEq(vm.parseJsonBytes32(pj, ".v1MemberRoot"), ROOT, "ROOT != params v1MemberRoot (stale constant?)");
        assertEq(vm.parseJsonUint(pj, ".genesisOffset"), GENESIS_OFFSET, "GENESIS_OFFSET != params (stale constant?)");
        uint256[] memory caps = vm.parseJsonUintArray(pj, ".addrCaps");
        uint256[9] memory expectedCaps = _addrCaps();
        assertEq(caps[0], expectedCaps[0], "addrCaps[0] != params (Genesis $25k cap drift?)");
    }

    function test_forkRehearsalV2b_fullFlow() public {
        // Re-assert the constant guard inside the fork path too, so a fork run can
        // never deploy from constants that drift from the deploy params file.
        test_rehearsalConstantsMatchDeployParams();

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
        sale = new SyndicateSaleV2(
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
        assertEq(sale.commissionRouter(), address(0), "router disarmed at deploy");
        assertEq(sale.V1_MEMBER_ROOT(), ROOT, "merged v1 root");
        assertEq(sale.MAX_USDC_PER_TX(), MAX_USDC_PER_TX, "maxUsdcPerTx $25k");
        assertEq(sale.RESERVE_THROUGH_SEAT(), RESERVE_THROUGH, "reserveThroughSeat");
        assertEq(sale.maxUsdcPerAddressPerEra(1), 25_000_000_000, "Era I addr cap == $25,000 (V2a $5 defect fixed)");
        assertEq(sale.eraSynCap(1), type(uint256).max, "eraSynCap[1] forced to max (Model 2)");

        // -------------------------------------------------- A'. Era I active for #6
        assertEq(sale.activeEra(), 1, "activeEra == 1 (Genesis)");
        assertEq(sale.currentEra(), 1, "currentEra == 1");
        assertEq(sale.nextSeatNumber(), 6, "next seat #6 (offset 5)");

        // fund the contract with SYN (separate post-deploy step in production)
        deal(SYN, address(sale), 50_000_000 ether);

        // -------------------------------------------------- B. recognize V2a member #3
        vm.prank(M3_V2A);
        sale.claimV1Membership(_proofM3());
        assertTrue(sale.knownMember(M3_V2A), "V2a member #3 recognized via merged root");
        assertEq(sale.memberCount(), 5, "recognition mints NO seat");

        // -------------------------------------------------- C. fresh newcomer -> #6 ($5)
        address newcomer = makeAddr("v2b-newcomer");
        uint256 d6 = _buy(newcomer, USDC_5);
        assertEq(sale.memberCount(), 6, "fresh buy -> memberCount 6");
        assertEq(sale.memberNumberOf(newcomer), 6, "newcomer is member #6");
        assertEq(d6, SYN_5, "newcomer got 500 SYN");
        assertEq(sale.usdcContributed(newcomer), USDC_5, "newcomer cumulative USDC == $5");

        // -------------------------------------------------- D. returning merged member -> NO 2nd seat
        uint256 m1Before = IERC20Like(SYN).balanceOf(M1_V1);
        deal(USDC, M1_V1, USDC_5);
        vm.startPrank(M1_V1);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(USDC_5, address(0), 0, _proofM1());
        vm.stopPrank();
        assertEq(sale.memberCount(), 6, "returning member mints NO second seat");
        assertEq(sale.memberNumberOf(M1_V1), 0, "merged member has no NEW V2b seat number");
        assertTrue(sale.knownMember(M1_V1), "merged member recognized");
        assertEq(IERC20Like(SYN).balanceOf(M1_V1) - m1Before, SYN_5, "merged member still received SYN");

        // -------------------------------------------------- E. amount ladder $25/$100/$1,000 -> #7,#8,#9
        address b25  = makeAddr("v2b-buy-25");
        address b100 = makeAddr("v2b-buy-100");
        assertEq(_buy(b25, USDC_25), SYN_25, "$25 -> 2,500 SYN");
        assertEq(sale.memberNumberOf(b25), 7, "$25 buyer is seat #7");
        assertEq(_buy(b100, USDC_100), SYN_100, "$100 -> 10,000 SYN");
        assertEq(sale.memberNumberOf(b100), 8, "$100 buyer is seat #8");

        // -------------------------------------------------- F. 70/20/10 routing on a $1,000 buy -> #9
        address b1k = makeAddr("v2b-buy-1k");
        uint256 vBefore = IERC20Like(USDC).balanceOf(VAULT);
        uint256 lBefore = IERC20Like(USDC).balanceOf(LIQ);
        uint256 oBefore = IERC20Like(USDC).balanceOf(OPS);
        assertEq(_buy(b1k, USDC_1K), SYN_1K, "$1,000 -> 100,000 SYN");
        assertEq(sale.memberNumberOf(b1k), 9, "$1,000 buyer is seat #9");
        assertEq(IERC20Like(USDC).balanceOf(VAULT) - vBefore, (USDC_1K * 70) / 100, "Vault +70% ($700)");
        assertEq(IERC20Like(USDC).balanceOf(LIQ)   - lBefore, (USDC_1K * 20) / 100, "Liquidity +20% ($200)");
        assertEq(IERC20Like(USDC).balanceOf(OPS)   - oBefore, USDC_1K - (USDC_1K * 70) / 100 - (USDC_1K * 20) / 100, "Operations +10% ($100)");
        assertEq(sale.commissionRouter(), address(0), "router STILL unset after routed buy");

        // -------------------------------------------------- G. HEADLINE: $10,000 Genesis buy -> #10
        address whale = makeAddr("v2b-genesis-whale");
        assertEq(_buy(whale, USDC_10K), SYN_10K, "$10,000 -> 1,000,000 SYN (largest Genesis package)");
        assertEq(sale.memberCount(), 10, "whale buy -> memberCount 10");
        assertEq(sale.memberNumberOf(whale), 10, "whale is member #10");

        // -------------------------------------------------- H. repeat purchase: SYN + recognition, NO new seat
        uint256 mcBefore = sale.memberCount();
        uint256 synBefore = IERC20Like(SYN).balanceOf(newcomer);
        uint256 cumBefore = sale.usdcContributed(newcomer);
        uint256 dRepeat = _buy(newcomer, USDC_25); // member #6 buys again
        assertEq(sale.memberCount(), mcBefore, "repeat buy mints NO second seat");
        assertEq(sale.memberNumberOf(newcomer), 6, "repeat buyer keeps seat #6");
        assertEq(IERC20Like(SYN).balanceOf(newcomer) - synBefore, SYN_25, "repeat buy still pays SYN (+2,500)");
        assertEq(dRepeat, SYN_25, "repeat synDelta == 2,500");
        assertEq(sale.usdcContributed(newcomer) - cumBefore, USDC_25, "repeat buy grows cumulative recognition (+$25)");
        assertEq(sale.usdcContributed(newcomer), USDC_5 + USDC_25, "newcomer cumulative USDC == $30");

        // -------------------------------------------------- final invariants
        assertEq(sale.commissionRouter(), address(0), "CommissionRouter remained UNSET for the whole rehearsal");
        assertEq(sale.activeEra(), 1, "still Era I (Genesis) -- all 5 new seats <= #333");

        console2.log("V2b FORK REHEARSAL OK: 5 prior members preserved, no duplicate seats,");
        console2.log("  ladder $5/$25/$100/$1k/$10k all funded, 70/20/10 routed, router unset.");
    }
}
