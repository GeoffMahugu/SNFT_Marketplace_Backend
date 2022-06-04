pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./NFTAuction.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
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
    }

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

    /* Returns the listing price of the contract */
    function getListingPriceByItemPrice(uint256 _price)
        public
        pure
        returns (uint256)
    {
        return ((_price) * 100) / 10000;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool _isAuction,
        uint256 _biddingTime,
        string memory _auctionEndDate,
        string memory _category,
        address _collectionAddress
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == getListingPriceByItemPrice(price),
            "Price must be equal to listing price"
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        if (_isAuction) {
            NFTAuction auc = new NFTAuction(
                _biddingTime,
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
                _collectionAddress
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
                _collectionAddress
            );
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
        bool _isAuction,
        uint256 _biddingTime,
        string memory _auctionEndDate
    ) public payable nonReentrant {
        require(
            msg.sender == idToMarketItem[itemId].owner,
            "Only owner can resale item"
        );
        require(
            msg.value == getListingPriceByItemPrice(price),
            "Price must be equal to listing price"
        );

        uint256 tokenId = idToMarketItem[itemId].tokenId;

        if (_isAuction) {
            NFTAuction auc = new NFTAuction(
                _biddingTime,
                _auctionEndDate,
                payable(msg.sender),
                payable(idToMarketItem[itemId].artist)
            );
            idToMarketItem[itemId].auction = address(auc);
        } else {
            idToMarketItem[itemId].auction = address(0);
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
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(
            getListingPriceByItemPrice(idToMarketItem[itemId].price)
        );
    }

    /* accept highest bid and transfer */
    function transferAsset(
        address nftContract,
        uint256 _itemId,
        address _buyer
    ) public returns (bool) {
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
        idToMarketItem[_itemId].sold = true;
        _itemsSold.increment();
        return true;
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns onlyl items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has created */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* get item by id */
    function getItemByID(uint256 _id) public view returns (MarketItem memory) {
        return idToMarketItem[_id];
    }

    /* get items by catgory */
    function fetctNFTsByCatgory(string memory _category)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                keccak256(bytes(idToMarketItem[i + 1].category)) ==
                keccak256(bytes(_category)) &&
                !idToMarketItem[i + 1].sold
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                keccak256(bytes(idToMarketItem[i + 1].category)) ==
                keccak256(bytes(_category)) &&
                !idToMarketItem[i + 1].sold
            ) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* get items by catgory */
    function fetctNFTsByCollection(address _collectionAddress)
        public
        view
        returns (MarketItem[] memory)
    {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (address(idToMarketItem[i + 1].collectionAddress) == address(_collectionAddress)) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (address(idToMarketItem[i + 1].collectionAddress) == address(_collectionAddress)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
