// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {SyndicateSaleV2} from "../src/SyndicateSaleV2.sol";

/// @title  Deploy SyndicateSaleV2
/// @notice Reads every constructor parameter from `script/deploy-params.json` and
///         deploys the sale. The CommissionRouter is FORCED to `address(0)`:
///         day-one carries NO referral wiring; the router is attached post-deploy
///         through the contract's own timelocked path. SYN funding is a SEPARATE
///         post-deploy transaction (the constructor pulls no SYN).
///
///         This script does NOT itself deploy when merely compiled — it only runs
///         under `forge script ... --broadcast`. Before any real run, fill
///         `deploy-params.json` from the live V1 snapshot (genesisOffset +
///         v1MemberRoot) and the ratified parameter sheet (caps), and follow
///         docs/proposals/SALE_V2_MAINNET_DIRECT_DEPLOYMENT_RUNBOOK.md.
///
///         Dry-run (simulate, no broadcast):
///           forge script script/Deploy.s.sol:Deploy --rpc-url $RPC
///         Broadcast:
///           forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --broadcast --verify
contract Deploy is Script {
    function run() external returns (SyndicateSaleV2 sale) {
        // PATH FOOTGUN GUARD. The params file is EXPLICIT via the DEPLOY_PARAMS
        // env var (default: the canonical script/deploy-params.json). A rehearsal
        // MUST point this at script/deploy-params.v2b.rehearsal.json so the stale
        // V1-only snapshot in deploy-params.json can NEVER be used by accident:
        //   DEPLOY_PARAMS=script/deploy-params.v2b.rehearsal.json forge script ...
        // (foundry.toml fs_permissions grants read to the whole ./script dir.)
        string memory paramsPath = vm.envOr("DEPLOY_PARAMS", string("script/deploy-params.json"));
        console2.log("deploy params file:", paramsPath);
        string memory json = vm.readFile(paramsPath);

        // FAIL-CLOSED deploy guard. The params file may carry a PROVISIONAL
        // pre-pause snapshot (genesisOffset / v1MemberRoot). A real mainnet
        // deploy MUST use the canonical snapshot regenerated from the V2a pause
        // block. While "provisional" is true the script refuses to run unless
        // ALLOW_PROVISIONAL_DEPLOY=1 is set explicitly — the forked-mainnet
        // rehearsal sets it; a mainnet operator must NOT. After regenerating the
        // snapshot, set "provisional": false in the JSON.
        bool provisional = vm.parseJsonBool(json, ".provisional");
        bool allowProvisional = vm.envOr("ALLOW_PROVISIONAL_DEPLOY", false);
        require(
            !provisional || allowProvisional,
            "Deploy: PROVISIONAL snapshot (genesisOffset/v1MemberRoot) - regenerate from the V2a pause block and set provisional=false, or set ALLOW_PROVISIONAL_DEPLOY=1 for a rehearsal"
        );

        address usdc = vm.parseJsonAddress(json, ".usdc");
        address syn = vm.parseJsonAddress(json, ".syn");
        address vault = vm.parseJsonAddress(json, ".vault");
        address liquidity = vm.parseJsonAddress(json, ".liquidity");
        address operations = vm.parseJsonAddress(json, ".operations");

        uint256 genesisOffset = vm.parseJsonUint(json, ".genesisOffset");
        bytes32 v1MemberRoot = vm.parseJsonBytes32(json, ".v1MemberRoot");
        uint256 maxUsdcPerTx = vm.parseJsonUint(json, ".maxUsdcPerTx");
        uint256 reserveThroughSeat = vm.parseJsonUint(json, ".reserveThroughSeat");

        // DOUBLE-ENTRY STALE-SNAPSHOT GUARD. The operator independently declares
        // the expected snapshot; a mismatch with the file means the WRONG (e.g.
        // stale V1-only offset=2/old-root) params were selected, and the deploy
        // reverts before any broadcast.
        //
        // HARD GUARD (the residual flagged in the launch-risk memo): for a real,
        // NON-provisional deploy the declaration is now MANDATORY — both
        // EXPECT_GENESIS_OFFSET and EXPECT_V1_ROOT must be set, or the script
        // refuses to run. This makes it impossible to silently broadcast the
        // stale default deploy-params.json without independently re-declaring the
        // snapshot. Provisional rehearsals (ALLOW_PROVISIONAL_DEPLOY=1) are
        // exempt, so the forked-mainnet rehearsal flow is unchanged.
        uint256 expectOffset = vm.envOr("EXPECT_GENESIS_OFFSET", uint256(0));
        bytes32 expectRoot = vm.envOr("EXPECT_V1_ROOT", bytes32(0));
        if (!provisional) {
            require(
                expectOffset != 0,
                "Deploy: EXPECT_GENESIS_OFFSET is REQUIRED for a non-provisional (mainnet) deploy"
            );
            require(
                expectRoot != bytes32(0),
                "Deploy: EXPECT_V1_ROOT is REQUIRED for a non-provisional (mainnet) deploy"
            );
        }
        if (expectOffset != 0) {
            require(genesisOffset == expectOffset, "Deploy: genesisOffset != EXPECT_GENESIS_OFFSET (stale snapshot?)");
        }
        if (expectRoot != bytes32(0)) {
            require(v1MemberRoot == expectRoot, "Deploy: v1MemberRoot != EXPECT_V1_ROOT (stale snapshot?)");
        }

        uint256[9] memory addrCaps = _toFixed9(vm.parseJsonUintArray(json, ".addrCaps"));
        uint256[9] memory eraCaps = _toFixed9(vm.parseJsonUintArray(json, ".eraCaps"));

        // Day-one no referral — the router is wired later via the timelocked path.
        address initialRouter = address(0);

        vm.startBroadcast();
        sale = new SyndicateSaleV2(
            usdc,
            syn,
            vault,
            liquidity,
            operations,
            genesisOffset,
            v1MemberRoot,
            addrCaps,
            maxUsdcPerTx,
            reserveThroughSeat,
            eraCaps,
            initialRouter
        );
        vm.stopBroadcast();

        console2.log("SyndicateSaleV2 deployed at:", address(sale));
        console2.log("owner (deployer, accept via Ownable2Step):", sale.owner());
        console2.log("memberCount (== genesisOffset):", sale.memberCount());
        console2.log("activeEra:", sale.activeEra());
        console2.log("commissionRouter (must be 0x0):", sale.commissionRouter());
    }

    function _toFixed9(uint256[] memory a) internal pure returns (uint256[9] memory out) {
        require(a.length == 9, "deploy-params: expected 9 cap entries");
        for (uint256 i = 0; i < 9; ++i) {
            out[i] = a[i];
        }
    }
}
