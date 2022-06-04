// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Fractional.sol";
import "./interfaces/IMarketplace.sol";

contract FractionalSale {

    struct FractionInfo {
        address frToken;  
        uint256 lastSoldPrice;  
        uint256 lastSoldTimestamp;
    }

    mapping(uint256 => FractionInfo) private _idToFractionInfo;
    mapping(uint256 => mapping(address => uint256)) _sharesClaimedTimestamp;

    address public constant MARKETPLACE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    IMarketplace private constant _market = IMarketplace(MARKETPLACE);

    modifier onlyTokenOwner(uint256 itemId) {
        require(msg.sender == _market.getItemOwner(itemId), "Must be token owner");
        _;
    }

    function getSharesClaimedTimestamp(uint256 itemId, address shareHolder) external view returns (uint256) {
        return _sharesClaimedTimestamp[itemId][shareHolder];
    }

    function setSharesClaimedTimestamp(uint256 itemId, uint256 claimTime, address shareHolder) external {
        require(_market.isRegisteredCaller(msg.sender));
        _sharesClaimedTimestamp[itemId][shareHolder] = claimTime; 
    }

    function getFractionInfo(uint256 itemId) external view returns (address frToken, uint256 lastSoldPrice, uint256 lastSoldTimestamp) {
        FractionInfo memory fInfo = _idToFractionInfo[itemId];
        return (fInfo.frToken, fInfo.lastSoldPrice, fInfo.lastSoldTimestamp);
    }

    function setLastSoldPrice(uint256 itemId, uint256 lastPrice) external {
        require(_market.isRegisteredCaller(msg.sender));
        _idToFractionInfo[itemId].lastSoldPrice = lastPrice;
    }

    function setLastSoldTimestamp(uint256 itemId, uint256 saleTime) external {
        require(_market.isRegisteredCaller(msg.sender));
        _idToFractionInfo[itemId].lastSoldTimestamp = saleTime;
    }

    //@notice Creates fractional tokens for input NFT
    //@param ID of item
    //@param Total amount of fractional tokens to create
    //@param Name for token
    //@param Symbol of token
    function fractionalize(
        uint256 itemId,
        uint256 _totalShares,
        string memory _name,
        string memory _symbol
    ) external onlyTokenOwner(itemId) {
        require(_totalShares > 0, "Invalid input(s)");
        require(_idToFractionInfo[itemId].frToken == address(0), "Already fractionalized");
        ERC20Fractional frToken = new ERC20Fractional(_name, _symbol, msg.sender, _totalShares);

        _idToFractionInfo[itemId] = FractionInfo(address(frToken), 0, 0);
    }
}
