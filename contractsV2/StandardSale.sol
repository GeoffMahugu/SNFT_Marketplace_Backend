// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMarketplace.sol";
import "./interfaces/IFractionalSale.sol";

contract StandardSale is ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Sale {
        uint256 pricePerToken;
        uint256 amount;
        uint256 saleStartTime;
        uint256 saleEndTime;
        address reservedFor;
        address saleToken;
    }

    address public constant MARKETPLACE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    address public constant FRACTIONAL_SALE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    string private constant INVALID_INPUT = "Input(s) are invalid";
    IMarketplace private constant _market = IMarketplace(MARKETPLACE);
    IFractionalSale private constant _fSale = IFractionalSale(FRACTIONAL_SALE);

    mapping(uint256 => Sale) private _idToSale;

    modifier onlyTokenOwner(uint256 itemId) {
        require(msg.sender == _market.getItemOwner(itemId), "Token owner only");
        _;
    }

    modifier notBlacklisted {
        require(!_market.getBlacklisted(msg.sender));
        _;
    }
    
    modifier notListedForSale(uint256 itemId) {
        require(_market.getItemForSale(itemId) == false, "Already listed for sale");
        _;
    }

    function getSaleInfo(uint256 itemId) external view returns (Sale memory) {
        return _idToSale[itemId];
    }

    //@notice Create a standard sale
    //@param Item ID of NFT
    //@param Price to purchase each NFT
    //@param Amount of NFTs for sale
    //@param Sale timespan in seconds
    //@param Address of token to be used for the sale
    function createSale(
        uint256 itemId,
        uint256 _pricePerToken,
        uint256 _amount,
        uint256 salePeriodInSeconds,
        address _saleToken
    ) external onlyTokenOwner(itemId) notListedForSale(itemId) {
        require(_pricePerToken > 0 && salePeriodInSeconds > 0 && _amount > 0, INVALID_INPUT);
        (uint256 tokenId, , address nftContract, , , bool forSale) = _market.getItemInfo(itemId);
        require(forSale == false);

        if(_isERC1155(nftContract)) {
            require(IERC1155(nftContract).balanceOf(msg.sender, tokenId) >= _amount, "Insufficient balance");
            require(IERC1155(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");
        } else {
            require(_amount == 1, INVALID_INPUT);
            require(IERC721(nftContract).getApproved(tokenId) == address(this), "Contract not approved");
        }

        _idToSale[itemId] = Sale({
            pricePerToken: _pricePerToken,
            amount: _amount,
            saleStartTime: block.timestamp,
            saleEndTime: block.timestamp + salePeriodInSeconds,
            reservedFor: address(0),
            saleToken: _market.isAcceptedToken(_saleToken) ? _saleToken : WBNB
        });
        _market.setItemForSale(itemId, true);
    }

    //@notice Create a standard sale reserved for a specific address
    function createReservedSale(
        uint256 itemId,
        uint256 _pricePerToken,
        uint256 _amount,
        uint256 salePeriodInSeconds,
        address _reservedFor,
        address _saleToken
    ) external onlyTokenOwner(itemId) notListedForSale(itemId) {
        require(_pricePerToken > 0 && salePeriodInSeconds > 0 && _reservedFor != address(0) && _amount > 0, INVALID_INPUT);
        (uint256 tokenId, , address nftContract, , , bool forSale) = _market.getItemInfo(itemId);
        require(forSale == false);

        if(_isERC1155(nftContract)) {
            require(IERC1155(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");
        } else {
            require(_amount == 1, INVALID_INPUT);
            require(IERC721(nftContract).getApproved(tokenId) == address(this), "Contract not approved");
        }

        _idToSale[itemId] = Sale({
            pricePerToken: _pricePerToken,
            amount: _amount,
            saleStartTime: block.timestamp,
            saleEndTime: block.timestamp + salePeriodInSeconds,
            reservedFor: _reservedFor,
            saleToken: _market.isAcceptedToken(_saleToken) ? _saleToken : WBNB
        });
        _market.setItemForSale(itemId, true);
    }

    //@notice Update price per token of an item listed for sale --- Caller must be owner of that item
    function updateItemPrice(uint256 itemId, uint256 newPricePerToken) external onlyTokenOwner(itemId) {
        require(_idToSale[itemId].pricePerToken != 0);  
        if(newPricePerToken > 0) {
            _idToSale[itemId].pricePerToken = newPricePerToken;
        }else {
            revert(INVALID_INPUT);
        }
    }

    function cancelSale(uint256 itemId) external onlyTokenOwner(itemId) {
        delete _idToSale[itemId];
        _market.setItemForSale(itemId, false);
    }

    function _isERC1155(address nftContract) private view returns (bool) {
        return IERC1155(nftContract).supportsInterface(0xd9b67a26);
    }

    //@notice Purchase an item listed for sale --- ERC721 
    //@param ID of item
    //@param Amount of ERC20 tokens to be used for the purchase - Must be approved first
    function purchaseItemERC721(uint256 itemId, uint256 amountOfTokens) external notBlacklisted nonReentrant {
        require(block.timestamp < _idToSale[itemId].saleEndTime, "Item not for sale");
        require(amountOfTokens >= _idToSale[itemId].pricePerToken, "amountOfTokens must be higher");
        (uint256 tokenId, uint256 royaltyPercentage, address nftContract, address tokenOwner, address royaltyRecipient, ) = _market.getItemInfo(itemId);
        require(IERC721(nftContract).supportsInterface(0x80ac58cd));
        if(_idToSale[itemId].reservedFor != address(0)) {
            require(msg.sender == _idToSale[itemId].reservedFor, "Item reserved");
        }
        delete _idToSale[itemId];

        address prevOwner = tokenOwner;
        _market.setItemOwner(itemId, msg.sender);
        _market.setItemForSale(itemId, false);
        _market.addTrade(itemId, prevOwner, msg.sender, 1, amountOfTokens);

        _transferFees(itemId, amountOfTokens, royaltyPercentage, prevOwner, royaltyRecipient);
        IERC721(nftContract).safeTransferFrom(prevOwner, msg.sender, tokenId);
    }

    //@notice Purchase an item listed for sale --- ERC1155 
    //@param ID of item
    //@param Amount of NFTs to buy
    //@param Amount of ERC20 tokens to be used for the purchase - Must be approved first
    function purchaseItemERC1155(
        uint256 itemId, 
        uint256 amountToPurchase, 
        uint256 amountOfTokens
    ) external notBlacklisted nonReentrant {
        require(block.timestamp < _idToSale[itemId].saleEndTime, "Item not for sale");
        require(amountToPurchase <= _idToSale[itemId].amount);
        (uint256 tokenId, uint256 royaltyPercentage, address nftContract, address tokenOwner, address royaltyRecipient, ) = _market.getItemInfo(itemId);
        require(_isERC1155(nftContract));
        require(amountOfTokens >= _idToSale[itemId].pricePerToken * amountToPurchase, "amountOfTokens must be higher");
        if(_idToSale[itemId].reservedFor != address(0)) {
            require(msg.sender == _idToSale[itemId].reservedFor, "Item reserved");
        }
        _idToSale[itemId].amount -= amountToPurchase;
        if(_idToSale[itemId].amount == 0) {
            delete _idToSale[itemId];
            _market.setItemForSale(itemId, false);
        }
        address prevOwner = tokenOwner;

        _market.setItemOwner(itemId, msg.sender);
        _market.addTrade(itemId, prevOwner, msg.sender, amountToPurchase, amountOfTokens);

        _transferFees(itemId, amountOfTokens, royaltyPercentage, prevOwner, royaltyRecipient);
        IERC1155(nftContract).safeTransferFrom(prevOwner, msg.sender, tokenId, amountToPurchase, "");
    }

    //@dev Private function to split payments to seller, royalty recipient and marketplace owner
    function _transferFees(
        uint256 itemId,
        uint256 amount,
        uint256 royaltyPercentage,
        address seller,
        address royaltyRecipient
    ) private {
        IERC20 sToken = IERC20(_idToSale[itemId].saleToken);
        require(sToken.allowance(msg.sender, address(this)) >= amount);

        uint256 feeAmt = amount * _market.getMarketplaceFee() / 1000;
        uint256 royaltyAmt = amount * royaltyPercentage / 1000;
        (address frToken, , ) = _fSale.getFractionInfo(itemId);

        sToken.safeTransferFrom(msg.sender, _market.owner(), feeAmt);
        if(royaltyAmt > 0) {
            sToken.safeTransferFrom(msg.sender, royaltyRecipient, royaltyAmt);
        }
        uint sellerAmt = amount - (feeAmt + royaltyAmt);
        if(frToken == address(0)) {
            sToken.safeTransferFrom(msg.sender, seller, sellerAmt);
        }else {
            _fSale.setLastSoldPrice(itemId, sellerAmt);
            _fSale.setLastSoldTimestamp(itemId, block.timestamp);
            sToken.transferFrom(msg.sender, address(this), sellerAmt);
            _transferShare(itemId, sellerAmt, block.timestamp, frToken, seller);
        }
    }
    
    //@notice Fractional token holders of given item can claim shares from last sale
    function claimSaleShare(uint256 itemId) external notBlacklisted nonReentrant {
        (address frToken, uint256 lastSoldPrice, uint256 lastSoldTimestamp) = _fSale.getFractionInfo(itemId);
        _transferShare(itemId, lastSoldPrice, lastSoldTimestamp, frToken, msg.sender);
    }
    
    //@notice Transfers appropriate amount from last sale relative to share to fractional token holders
    function _transferShare(uint256 itemId, uint256 lastSoldPrice, uint256 lastSoldTimestamp, address frToken, address shareholder) private {
        require(lastSoldPrice > 0, "Item not sold");
        if(lastSoldTimestamp < _fSale.getSharesClaimedTimestamp(itemId, shareholder)) {
            revert("Share claimed");
        }
        _fSale.setSharesClaimedTimestamp(itemId, block.timestamp, shareholder);
        uint256 shares = IERC20(frToken).balanceOf(shareholder);
        uint256 tokenAmt = lastSoldPrice * shares / IERC20(frToken).totalSupply();

        IERC20(_idToSale[itemId].saleToken).safeTransfer(msg.sender, tokenAmt);
    }   
}
