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
        string memory json = vm.readFile("script/deploy-params.json");

        address usdc = vm.parseJsonAddress(json, ".usdc");
        address syn = vm.parseJsonAddress(json, ".syn");
        address vault = vm.parseJsonAddress(json, ".vault");
        address liquidity = vm.parseJsonAddress(json, ".liquidity");
        address operations = vm.parseJsonAddress(json, ".operations");

        uint256 genesisOffset = vm.parseJsonUint(json, ".genesisOffset");
        bytes32 v1MemberRoot = vm.parseJsonBytes32(json, ".v1MemberRoot");
        uint256 maxUsdcPerTx = vm.parseJsonUint(json, ".maxUsdcPerTx");
        uint256 reserveThroughSeat = vm.parseJsonUint(json, ".reserveThroughSeat");

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
