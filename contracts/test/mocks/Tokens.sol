// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Standard, well-behaved ERC20 with configurable decimals + open mint.
///         Used as canonical USDC (6dp) and SYN (18dp) in tests.
contract MockERC20 is ERC20 {
    uint8 private immutable _dec;

    constructor(string memory n, string memory s, uint8 d) ERC20(n, s) {
        _dec = d;
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }
}

/// @notice USDC-like token whose transfers touching a blocked address REVERT
///         (mirrors real Circle USDC blocklist behavior). Used to exercise the
///         router's push-then-escrow fallback for an unreachable referrer.
contract BlocklistERC20 is ERC20 {
    uint8 private immutable _dec;
    mapping(address => bool) public blocked;

    constructor(string memory n, string memory s, uint8 d) ERC20(n, s) {
        _dec = d;
    }

    function decimals() public view override returns (uint8) {
        return _dec;
    }

    function mint(address to, uint256 amt) external {
        _mint(to, amt);
    }

    function setBlocked(address a, bool b) external {
        blocked[a] = b;
    }

    function _update(address from, address to, uint256 value) internal override {
        require(!blocked[from] && !blocked[to], "USDC: blocked");
        super._update(from, to, value);
    }
}
