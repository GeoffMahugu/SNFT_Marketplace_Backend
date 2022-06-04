// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Fractional is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        address recipient,
        uint256 _totalShares
    ) ERC20(_name, _symbol) {
        _mint(recipient, _totalShares);
    }
}
