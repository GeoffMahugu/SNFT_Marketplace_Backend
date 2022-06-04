pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFTSingleCollection.sol";

contract NFTCollections is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    struct Collection {
        uint256 itemId;
        address collectionAddress;
        address collectionOwner;
    }

    mapping(uint256 => Collection) private idToCollectionItem;

    function createCollection(string memory _name, string memory _imageUrl, string memory _coverUrl) public {
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        NFTSingleCollection newCollectionItem = new NFTSingleCollection(
            _name,
            _imageUrl,
            _coverUrl
        );
        idToCollectionItem[itemId] = Collection(itemId, address(newCollectionItem), msg.sender);
    }

    function getAllCollections() public view returns (Collection[] memory)  {
        uint256 itemCount = _itemIds.current();
        uint256 currentIndex = 0;

        Collection[] memory items = new Collection[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            Collection storage currentItem = idToCollectionItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    /* get collection by address id */
    function getCollectionByAddress(uint256 _id) public view returns (Collection memory) {
        return idToCollectionItem[_id];
    }

    /* get collection by address id */
    function getCollectionByOwnerAddress(address _owner) public view returns (Collection[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint ownerCollectionCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToCollectionItem[i + 1].collectionOwner == _owner) {
                ownerCollectionCount += 1;
            }
        }
        Collection[] memory items = new Collection[](ownerCollectionCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToCollectionItem[i + 1].collectionOwner == _owner) {
                uint256 currentId = i + 1;
                Collection storage currentItem = idToCollectionItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

}
