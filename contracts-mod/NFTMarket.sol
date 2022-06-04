pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./NFTAuction.sol";

contract NFTMarket {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;
    uint256 listingPrice = 0.025 ether;
    uint256 commissionRate = 25; //Percentage multiplied by 100. So, 25 = 2.5%
    address payable owner;
    struct Trade {
      address buyer;
      address seller;
      uint256 price;
      uint256 time;
    }
    
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        address auction;
        string category;
        address payable artist;
        address collectionAddress;
        bool isRemoved;
    }
    mapping(uint => Trade[]) private _idToTradeHistory;
    mapping(uint256 => uint256) private _idToRoyaltyPercentage;
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );
    constructor() {
        owner = payable(msg.sender);
    }

    function _addTrade(uint256 id, address _buyer, address _seller, uint _price, uint _saleTime) private {
        _idToTradeHistory[id].push(Trade(_buyer, _seller, _price, _saleTime));
    }
    //Enter as percentage * 10. Example: 50 for 5% 
    function setCommissionRate(uint256 _newCommissionRate) external {
        require(msg.sender == owner);
        commissionRate = _newCommissionRate;
    }

    /* Returns the listing price of the contract */
    function getListingPriceByItemPrice(uint256 _price)
        private
        view
        returns (uint256)
    {
        return (_price * commissionRate) / 1000;
    }

    /* Returns the listing price of the contract */
    function getCommissionRate() public view returns (uint256) {
        return commissionRate;
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 _royaltyPercentage,
        bool _isAuction,
        uint256 _biddingTime,
        string memory _auctionEndDate,
        string memory _category,
        address _collectionAddress
    ) external payable {
        require(price > 0, "Invalid amount");
        if(msg.sender != owner) {
            require(msg.value >= listingPrice, "Insufficient amount sent");
        }

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        if (_isAuction) {
            NFTAuction auc = new NFTAuction(
                _biddingTime,
                _royaltyPercentage,
                _auctionEndDate,
                payable(msg.sender),
                payable(msg.sender)
            );
            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                payable(msg.sender),
                payable(address(0)),
                price,
                false,
                address(auc),
                _category,
                payable(msg.sender),
                _collectionAddress,
                false
            );
        } else {
            idToMarketItem[itemId] = MarketItem(
                itemId,
                nftContract,
                tokenId,
                payable(msg.sender),
                payable(address(0)),
                price,
                false,
                address(0),
                _category,
                payable(msg.sender),
                _collectionAddress,
                false
            );
            _idToRoyaltyPercentage[itemId] = _royaltyPercentage;
        }
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    /* resale bought item */
    function resaleBoughtItem(
        address nftContract,
        uint256 itemId,
        uint256 price,
        uint _royaltyPercentage,
        bool _isAuction,
        uint256 _biddingTime,
        string memory _auctionEndDate
    ) external payable {
        require(
            msg.sender == idToMarketItem[itemId].owner,
            "Only owner can resale item"
        );
        if(msg.sender != owner) {
            require(
            msg.value >= listingPrice, "Price must be equal to listing price");
        }

        uint256 tokenId = idToMarketItem[itemId].tokenId;

        if (_isAuction) {
            NFTAuction auc = new NFTAuction(
                _biddingTime,
                _royaltyPercentage,
                _auctionEndDate,
                payable(msg.sender),
                payable(idToMarketItem[itemId].artist)
            );
            idToMarketItem[itemId].auction = address(auc);
        } else {
            idToMarketItem[itemId].auction = address(0);
            _idToRoyaltyPercentage[itemId] = _royaltyPercentage;
        }
        idToMarketItem[itemId].price = price;
        idToMarketItem[itemId].seller = payable(msg.sender);
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].sold = false;

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        _itemsSold.decrement();
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(address nftContract, uint256 itemId)
        external
        payable
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(idToMarketItem[itemId].sold == false, "Item is not on sale");
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        uint commission = getListingPriceByItemPrice(idToMarketItem[itemId].price);
        payable(owner).transfer(
            commission
        );
        uint salePrice = msg.value - commission;
        uint royalty = (salePrice * _idToRoyaltyPercentage[itemId] / 1000) ;
        if(royalty > 0) {
            idToMarketItem[itemId].artist.transfer(royalty);
        }
        idToMarketItem[itemId].seller.transfer(salePrice - royalty);
        _addTrade(itemId, msg.sender, idToMarketItem[itemId].seller, msg.value, block.timestamp);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].seller = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        
        _itemsSold.increment();
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }
    function fetchTradeHistory(uint itemId) external view returns (Trade[] memory){
        return _idToTradeHistory[itemId];
    }
    /* accept highest bid and transfer */
    function transferAsset(
        address nftContract,
        uint256 _itemId,
        address _buyer
    ) external returns (bool) {
        uint256 tokenId = idToMarketItem[_itemId].tokenId;
        require(
            idToMarketItem[_itemId].auction != address(0),
            "Auction does not exist"
        );
        require(
            idToMarketItem[_itemId].seller == msg.sender,
            "Only seller can transfer asset"
        );

        IERC721(nftContract).transferFrom(address(this), _buyer, tokenId);
        idToMarketItem[_itemId].owner = payable(_buyer);
        idToMarketItem[_itemId].seller = payable(_buyer);
        idToMarketItem[_itemId].sold = true;
        _itemsSold.increment();
        return true;
    }

    function fetchItems() external view returns (MarketItem[] memory) {
        MarketItem[] memory items = new MarketItem[](_itemIds.current());
        for(uint i=1; i<=_itemIds.current(); i++){
            items[i-1] = idToMarketItem[i];
        }
        return items;
    }
   
    /* get item by id */
    function getItemByID(uint256 _id) external view returns (MarketItem memory) {
        return idToMarketItem[_id];
    }

    /* Gift nft to some address */
    function giftAsset(
        address nftContract,
        uint256 _itemId,
        address _receiver
    ) external returns (bool) {
        uint256 tokenId = idToMarketItem[_itemId].tokenId;
        require(
            idToMarketItem[_itemId].seller == msg.sender,
            "Only owner can gift asset"
        );

        IERC721(nftContract).transferFrom(address(this), _receiver, tokenId);
        idToMarketItem[_itemId].owner = payable(_receiver);
        idToMarketItem[_itemId].seller = payable(_receiver);
        return true;
    }

    /* Gift nft to some address */
    function removeItem(uint256 _itemId) external returns (bool) {
        require(owner == msg.sender, "Only owner can remove item");
        idToMarketItem[_itemId].isRemoved = true;
        return true;
    }
}
