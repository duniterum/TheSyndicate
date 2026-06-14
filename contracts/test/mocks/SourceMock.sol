// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CommissionRouterV1, CommissionRouteInput} from "../../src/CommissionRouterV1.sol";

/// @notice Stand-in for an allow-listed "source" (a sale) when UNIT-testing the
///         CommissionRouterV1 in isolation. Exposes the IMembershipRegistry
///         `knownMember` view the router calls back into, holds the Operations
///         slice, approves the router to pull it, and forwards route() calls so
///         `msg.sender` (the source) is this contract.
contract MockSource {
    mapping(address => bool) public knownMember;

    function setKnown(address a, bool v) external {
        knownMember[a] = v;
    }

    function approveRouter(IERC20 usdc, address router, uint256 amt) external {
        usdc.approve(router, amt);
    }

    function doRoute(CommissionRouterV1 router, CommissionRouteInput calldata p)
        external
        returns (uint256 referrerAmount, uint256 operationsAmount)
    {
        return router.route(p);
    }
}
