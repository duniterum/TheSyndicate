// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import {SyndicateSaleV2} from "../src/SyndicateSaleV2.sol";

interface IERC20Like {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

/// @title  Forked-mainnet deploy rehearsal for SyndicateSaleV2
/// @notice REHEARSAL ONLY — no mainnet deploy, no funds, no V1 touch. Deploys the
///         production contract on an Avalanche C-Chain fork using the EXACT values
///         in script/deploy-params.json (real USDC/SYN/wallet addresses, the J3
///         per-era address-cap ramp, Model B SYN caps, PROVISIONAL pre-pause
///         snapshot genesisOffset=2 + v1MemberRoot) and exercises:
///           - constructor read-back (owner, 14-day timelocks, caps, router=0, root)
///           - Era I active for member #3 (genesisOffset 2 => next seat #3)
///           - claimV1Membership with the PROVISIONAL proof for a real V1 member
///           - first fresh V2 buy mints member #3
///           - a returning V1 buyer (valid proof) mints NO second seat
///
///         Skips cleanly when AVAX_RPC is unset so the default `forge test` (no
///         network) is unaffected. Run:
///           AVAX_RPC=<rpc> forge test --match-contract RehearsalFork -vv
contract RehearsalForkTest is Test {
    // --- real mainnet addresses (must match script/deploy-params.json) ---
    address constant USDC  = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    address constant SYN   = 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170;
    address constant VAULT = 0x205DdC8921A4C60106930eE35e1F395c8D13f464;
    address constant LIQ   = 0xa9b072db8DcDbb470235204B69D37275d74a2e25;
    address constant OPS   = 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80;

    // --- PROVISIONAL pre-pause snapshot (regenerate from the pause block) ---
    bytes32 constant ROOT = 0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff;
    address constant V1_A = 0x244531C571966f90f4849e03a507543d90f9C721; // member #1
    address constant V1_B = 0x3488857b003104e2B08A1D198f8a23BFF28B0045; // member #2
    bytes32 constant PROOF_A = 0x3eb58fd16895751acdd571cb5db11df332a3c61a317fe3cdbba62311120dd484;
    bytes32 constant PROOF_B = 0x2f88566ae4accbe296cd9222269a1eeeb4d56bf2c96a9f4bab14a2a9623e5fe3;

    uint256 constant GENESIS_OFFSET     = 2;
    uint256 constant MAX_USDC_PER_TX    = 25_000_000_000;   // $25,000 (6dp)
    uint256 constant RESERVE_THROUGH    = 10_000;
    uint256 constant ERA_I_MIN_USDC     = 5_000_000;        // $5 (6dp)
    uint256 constant ERA_I_SYN_OUT      = 500 ether;        // $5 * 100 SYN/USDC

    function _addrCaps() internal pure returns (uint256[9] memory a) {
        a[0] = 5_000_000;       // Era I  (Genesis, Model 2 binding) $5
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

    function test_forkRehearsal_fullFlow() public {
        string memory rpc = vm.envOr("AVAX_RPC", string(""));
        if (bytes(rpc).length == 0) {
            emit log("AVAX_RPC unset -> skipping forked-mainnet rehearsal");
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
        console2.log("deployed SyndicateSaleV2 at:", address(sale));

        // -------------------------------------------------- A. constructor read-back
        assertEq(sale.owner(), address(this), "owner == deployer");
        assertEq(sale.RECOVERY_TIMELOCK(), 14 days, "recovery timelock 14d");
        assertEq(sale.ROUTER_TIMELOCK(), 14 days, "router timelock 14d");
        assertEq(sale.GENESIS_OFFSET(), GENESIS_OFFSET, "GENESIS_OFFSET");
        assertEq(sale.memberCount(), GENESIS_OFFSET, "memberCount == offset");
        assertEq(sale.commissionRouter(), address(0), "router disarmed");
        assertEq(sale.V1_MEMBER_ROOT(), ROOT, "v1 root");
        assertEq(address(sale.USDC()), USDC, "usdc");
        assertEq(address(sale.SYN()), SYN, "syn");
        assertEq(address(sale.VAULT()), VAULT, "vault");
        assertEq(address(sale.LIQUIDITY()), LIQ, "liquidity");
        assertEq(address(sale.OPERATIONS()), OPS, "operations");
        assertEq(sale.MAX_USDC_PER_TX(), MAX_USDC_PER_TX, "maxUsdcPerTx");
        assertEq(sale.RESERVE_THROUGH_SEAT(), RESERVE_THROUGH, "reserveThroughSeat");

        // per-era caps echoed; eraSynCap[1] forced to max under Model 2
        uint256[9] memory ac = _addrCaps();
        uint256[9] memory ec = _eraCaps();
        for (uint16 e = 1; e <= 9; e++) {
            assertEq(sale.maxUsdcPerAddressPerEra(e), ac[e - 1], "addrCap echo");
            if (e == 1) {
                assertEq(sale.eraSynCap(e), type(uint256).max, "eraSynCap[1] == max");
            } else {
                assertEq(sale.eraSynCap(e), ec[e - 1], "eraSynCap echo");
            }
        }

        // -------------------------------------------------- B. Era I active for #3
        assertEq(sale.activeEra(), 1, "activeEra == 1 (Genesis)");
        assertEq(sale.currentEra(), 1, "currentEra == 1");
        assertEq(sale.nextSeatNumber(), 3, "next seat #3");

        // fund the contract with SYN (separate post-deploy step in production)
        deal(SYN, address(sale), 5_000_000 ether);
        assertEq(IERC20Like(SYN).balanceOf(address(sale)), 5_000_000 ether, "syn funded");

        // -------------------------------------------------- C. claimV1Membership
        bytes32[] memory proofB = new bytes32[](1);
        proofB[0] = PROOF_B;
        vm.prank(V1_B);
        sale.claimV1Membership(proofB);
        assertTrue(sale.knownMember(V1_B), "V1_B recognized");
        assertEq(sale.memberCount(), 2, "claim mints NO seat");

        // -------------------------------------------------- D. first fresh V2 buy -> #3
        address newcomer = makeAddr("v2newcomer");
        deal(USDC, newcomer, 1_000_000_000); // $1,000 headroom
        bytes32[] memory noProof = new bytes32[](0);
        vm.startPrank(newcomer);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(ERA_I_MIN_USDC, address(0), 0, noProof);
        vm.stopPrank();
        assertEq(sale.memberCount(), 3, "fresh buy -> memberCount 3");
        assertEq(sale.memberNumberOf(newcomer), 3, "newcomer is member #3");
        assertEq(IERC20Like(SYN).balanceOf(newcomer), ERA_I_SYN_OUT, "newcomer got 500 SYN");

        // -------------------------------------------------- E. returning V1 buyer -> NO 2nd seat
        bytes32[] memory proofA = new bytes32[](1);
        proofA[0] = PROOF_A;
        // V1_A is a REAL on-chain V1 member who already holds SYN from their V1
        // purchase, so assert the DELTA (+500 SYN), not an absolute balance.
        uint256 v1aSynBefore = IERC20Like(SYN).balanceOf(V1_A);
        deal(USDC, V1_A, 1_000_000_000);
        vm.startPrank(V1_A);
        IERC20Like(USDC).approve(address(sale), type(uint256).max);
        sale.buy(ERA_I_MIN_USDC, address(0), 0, proofA);
        vm.stopPrank();
        assertEq(sale.memberCount(), 3, "returning V1 buyer mints NO second seat");
        assertEq(sale.memberNumberOf(V1_A), 0, "V1_A has no V2 seat number");
        assertTrue(sale.knownMember(V1_A), "V1_A recognized");
        assertEq(
            IERC20Like(SYN).balanceOf(V1_A) - v1aSynBefore,
            ERA_I_SYN_OUT,
            "V1_A still received SYN (delta)"
        );

        console2.log("FORK REHEARSAL OK: memberCount stays 3 after returning-V1 buy");
    }
}
