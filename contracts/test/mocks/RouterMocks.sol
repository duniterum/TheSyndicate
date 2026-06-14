// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {ICommissionRouter, CommissionRouteInput} from "../../src/SyndicateSaleV2.sol";

/// @notice A router that ALWAYS reverts. Used to prove SyndicateSaleV2.buy()
///         falls back to paying the full Operations slice to the Operations
///         wallet (no referral) when the referral path fails.
contract RevertingRouter is ICommissionRouter {
    function route(CommissionRouteInput calldata) external pure returns (uint256, uint256) {
        revert("router: forced revert");
    }
}

interface ISaleBuy {
    function buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] calldata v1Proof) external;
}

/// @notice A router that attempts to re-enter SyndicateSaleV2.buy() from inside
///         route(). The sale's nonReentrant guard must revert the nested call;
///         that revert propagates out of route() and is caught by the sale's
///         try/catch, so the OUTER buy completes via the safe fallback path.
contract ReentrantRouter is ICommissionRouter {
    address public sale;

    function setSale(address s) external {
        sale = s;
    }

    function route(CommissionRouteInput calldata p) external returns (uint256, uint256) {
        bytes32[] memory empty = new bytes32[](0);
        // This reverts (ReentrancyGuard) -> route() reverts -> sale falls back.
        ISaleBuy(sale).buy(p.opsSlice, address(0), 0, empty);
        return (0, p.opsSlice);
    }
}
