// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarketplace {
    function addTrade(uint256 itemId, address _from, address _to, uint256 _amount, uint256 _price) external;
    function getItemInfo(uint256 itemId) external view returns (uint256 tokenId, uint256 royaltyPercentage, address nftContract, address currentOwner, address royaltyRecipient, bool saleOngoing);
    function getItemForSale(uint256 itemId) external returns (bool);
    function setItemForSale(uint256 itemId, bool saleState) external;
    function setFractionalToken(uint256 itemId, address fToken) external;
    function getItemOwner(uint256 itemId) external returns (address);
    function setItemOwner(uint256 itemId, address newOwner) external;
    function isRegisteredCaller(address caller) external view returns (bool);
    function getMarketplaceFee() external view returns (uint256);
    function getBlacklisted(address user) external returns (bool);
    function isAcceptedToken(address token) external view returns (bool);
    function owner() external view returns (address);
}
