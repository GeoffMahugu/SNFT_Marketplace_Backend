// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721Minter {
    function mintToken(
        address recipient, 
        string memory tokenUri
    ) external returns (uint256);
}
