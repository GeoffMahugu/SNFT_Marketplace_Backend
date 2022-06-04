// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFractionalSale {
    function getFractionInfo(uint256 itemId) external returns (address frToken, uint256 lastSoldPrice, uint256 lastSoldTimestamp);
    function setSharesClaimedTimestamp(uint256 itemId, uint256 claimTime, address shareHolder) external;
    function getSharesClaimedTimestamp(uint256 itemId, address shareHolder) external view returns (uint256);
    function setLastSoldPrice(uint256 itemId, uint256 lastPrice) external;
    function setLastSoldTimestamp(uint256 itemId, uint256 saleTime) external;
}
