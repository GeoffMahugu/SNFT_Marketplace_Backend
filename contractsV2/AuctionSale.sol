// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./interfaces/IMarketplace.sol";
import "./interfaces/IFractionalSale.sol";


contract AuctionSale is ReentrancyGuard {
    using SafeERC20 for IERC20;
    struct Auction {
        uint256 highestBid;
        uint256 amount;
        uint256 reserve;
        uint256 auctionStartTime;
        uint256 auctionEndTime;
        address highestBidder;
        address saleToken;
    }
    
    uint256 private _waitingPeriod = 7 days; //TEST VALUE. REPLACE AS NEEDED
    address public constant MARKETPLACE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    address public constant FRACTIONAL_SALE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    IMarketplace private constant _market = IMarketplace(MARKETPLACE);
    IFractionalSale private constant _fSale = IFractionalSale(FRACTIONAL_SALE);
    
    string private constant MUST_BE_TOKEN_OWNER = "You are not the owner";
    string private constant INVALID_INPUT = "Invalid input parameter(s)";
    string private constant INSUFFICIENT_AMT = "Insufficient amount sent";
    string private constant NOT_FOR_SALE = "Item not for sale";
    string private constant SALE_ACTIVE = "Item currently listed for sale";
    string private constant ITEM_LISTED = "Item has already been listed";

    mapping(uint256 => Auction) private _idToAuction;

    modifier notBlacklisted {
        require(!_market.getBlacklisted(msg.sender));
        _;
    }

    modifier onlyTokenOwner(uint256 itemId) {
        require(msg.sender == _market.getItemOwner(itemId), MUST_BE_TOKEN_OWNER);
        _;
    }

    modifier notListedForSale(uint256 itemId) {
        require(_market.getItemForSale(itemId) == false, SALE_ACTIVE);
        _;
    }

    function getAuctionInfo(uint256 itemId) external view returns (Auction memory) {
        return _idToAuction[itemId];
    }

    //@notice Creates an auction for listed item
    //@param Item ID of NFT
    //@param Amount of NFTs for sale
    //@param Minimum bidding price - optional
    //@param Auction timespan in seconds
    //@param Address of token to be used for the sale
    function createAuction(
        uint256 itemId,
        uint256 _amount,
        uint256 _reserve,
        uint256 _biddingPeriodInSeconds,
        address _saleToken
    ) external onlyTokenOwner(itemId) notListedForSale(itemId) {
        require(_biddingPeriodInSeconds > 0 && _amount > 0, INVALID_INPUT);
        (uint256 tokenId, , address nftContract, , , bool forSale) = _market.getItemInfo(itemId);
        require(forSale == false, "Item already on sale");

        if(IERC1155(nftContract).supportsInterface(0xd9b67a26)) {
            require(IERC1155(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");
        } else {
            require(_amount == 1);
            require(IERC721(nftContract).getApproved(tokenId) == address(this));
        }

        _idToAuction[itemId] = Auction({
            highestBid: 0,
            amount: _amount,
            reserve: _reserve,
            auctionStartTime: block.timestamp,
            auctionEndTime: block.timestamp + _biddingPeriodInSeconds,
            highestBidder: address(0),
            saleToken: _market.isAcceptedToken(_saleToken) ? _saleToken : WBNB
        });
        _market.setItemForSale(itemId, true);
    }
    
    //@notice Places bid on an item for listed for auction
    //@param Item ID of NFT
    //@param Amount of ERC20 tokens to bid - Must be approved first
    function placeBid(uint256 itemId, uint256 amountOfTokens) external notBlacklisted nonReentrant {
        Auction storage auction = _idToAuction[itemId];
        IERC20 sToken = IERC20(_idToAuction[itemId].saleToken);
        require(sToken.allowance(msg.sender, address(this)) >= amountOfTokens);
        require(block.timestamp <= auction.auctionEndTime, NOT_FOR_SALE);
        if(auction.highestBid == 0) {
            require(amountOfTokens >= auction.reserve, INSUFFICIENT_AMT);
        }else{
            require(amountOfTokens > auction.highestBid, INSUFFICIENT_AMT);
            _refundPrevHighestBidder(auction.highestBidder, _idToAuction[itemId].saleToken, auction.highestBid);
        }
        auction.highestBidder = msg.sender;
        auction.highestBid = amountOfTokens; 

        sToken.transferFrom(msg.sender, address(this), amountOfTokens);
    }

    //@notice Refunds previous highest bidder if they get outbid
    function _refundPrevHighestBidder(
      address recipient,
      address sToken,
      uint256 amount
    ) private {
        IERC20(sToken).safeTransfer(recipient, amount);
    }

    //@notice End an auction by accepting the highest bid
    //@dev Resets auction data
    //@dev Splits and transfers highest bid to recipients
    //@dev Transfers NFT to highest bidder
    //@param Item ID of NFT
    function acceptBid(uint256 itemId) external nonReentrant {
        Auction memory auction = _idToAuction[itemId];
        (uint256 tokenId, uint256 royaltyPercentage, address nftContract, address tokenOwner, address royaltyRecipient, ) = _market.getItemInfo(itemId);
        address prevOwner = tokenOwner;
        require(prevOwner == msg.sender, MUST_BE_TOKEN_OWNER);
        require(auction.auctionEndTime < block.timestamp, SALE_ACTIVE);
        if(auction.highestBid == 0) {
          delete _idToAuction[itemId];
          return;
        }
        uint256 hBid = auction.highestBid;
        uint256 nftAmount = auction.amount;
        address hBidder = auction.highestBidder;
        delete _idToAuction[itemId];

        _market.setItemOwner(itemId, hBidder);    
        _market.setItemForSale(itemId, false);
        _market.addTrade(itemId, prevOwner, hBidder, nftAmount, hBid);

        _transferFees(itemId, hBid, royaltyPercentage, prevOwner, royaltyRecipient);
        if(IERC1155(nftContract).supportsInterface(0xd9b67a26)) {
            IERC1155(nftContract).safeTransferFrom(prevOwner, hBidder, tokenId, nftAmount, "");
        } else {
            IERC721(nftContract).safeTransferFrom(prevOwner, hBidder, tokenId);
        }
    }

    //@notice End an auction by rejecting highest bid
    //@dev Resets auction data
    //@dev Refunds highest bidder if available
    //@param Item ID of NFT
    function rejectBid(uint256 itemId) external onlyTokenOwner(itemId) nonReentrant {
        Auction memory auction = _idToAuction[itemId];
        require(block.timestamp > auction.auctionEndTime);
        if(auction.highestBid == 0) {
          delete _idToAuction[itemId];
          return;
        }
        uint256 hBid = auction.highestBid;
        address hBidder = auction.highestBidder;
        delete _idToAuction[itemId];

        _market.setItemForSale(itemId, false);
        _refundPrevHighestBidder(hBidder, _idToAuction[itemId].saleToken, hBid);
    }

    //@notice Take back highest bid in case of unresponsive buyer - Caller must be highest bidder 
    //@notice Must wait _waitingPeriod (tentative) after auction end to reclaim funds
    //@param ID of item
    function withdrawBid(uint256 itemId) external nonReentrant {
        require(block.timestamp > _idToAuction[itemId].auctionEndTime + _waitingPeriod, SALE_ACTIVE); 
        require(msg.sender == _idToAuction[itemId].highestBidder, "Caller must be highest bidder");
        uint256 hBid = _idToAuction[itemId].highestBid;
        address hBidder = _idToAuction[itemId].highestBidder;
        delete _idToAuction[itemId].highestBid;
        delete _idToAuction[itemId].highestBidder;

        _refundPrevHighestBidder(hBidder, _idToAuction[itemId].saleToken, hBid);
    }

    //@notice Change waiting period to reclaim funds --- Caller must be marketplace owner
    //@param New waiting period in seconds
    function updateWaitingPeriod(uint256 _waitingPeriodInSeconds) external {
        require(msg.sender == _market.owner());
        _waitingPeriod = _waitingPeriodInSeconds;
    }

    //@dev Private function to split payments to seller, royalty recipient and marketplace owner
    function _transferFees(
        uint256 itemId,
        uint256 amount,
        uint256 royaltyPercentage,
        address seller,
        address royaltyRecipient
    ) private {
        IERC20 sToken = IERC20(_idToAuction[itemId].saleToken);
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

        IERC20(_idToAuction[itemId].saleToken).safeTransfer(msg.sender, tokenAmt);
    }    

}
