// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC721Serialized.sol";
import "./interfaces/IMarketplace.sol";
import "./interfaces/IFractionalSale.sol";

contract Serialization is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct SerializedNFT {
        uint256 editions;
        address nftContract;
        address collectionCreator;
    }

    struct SteppedSale {
        uint256 saleStartTime;
        uint256 saleEndTime;
        uint256 basePrice;
        uint256 stepPrice;
        uint256 totalSold;
        address saleToken;
    }

    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;  
    address public constant MARKETPLACE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    address public constant FRACTIONAL_SALE = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //DUMMY ADDRESS. REPLACE BEFORE DEPLOYING
    
    IMarketplace private constant _market = IMarketplace(MARKETPLACE);
    IFractionalSale private constant _fSale = IFractionalSale(FRACTIONAL_SALE);

    mapping(uint256 => SerializedNFT) private _idToSerializationInfo;
    mapping(uint256 => SteppedSale) private _idToSteppedSale;

    event NFTSerialized(address collectionAddress, address createdBy, uint256 creationTime);
    event EditionPurchased(uint256 indexed itemId, uint256 editionNum, uint256 salePrice, uint256 saleTime, address from, address to);

    function getSerializationInfo(uint256 itemId) external view returns (SerializedNFT memory) {
        return _idToSerializationInfo[itemId];
    }

    function getSteppedSaleInfo(uint256 itemId) external view returns (SteppedSale memory) {
        return _idToSteppedSale[itemId];
    }

    //@dev Creates an editioned collection of an NFT from the given item ID
    //@param ID of item
    //@param Number of editions available
    //@param Name of NFT
    //@param Symbol of NFT
    function serialize(
        uint256 itemId, 
        uint256 numberOfEditions,
        string memory _name,
        string memory _symbol
    ) external {
        require(numberOfEditions > 0, "Editions cannot be zero");
        require(_idToSerializationInfo[itemId].editions == 0, "Already serialized");
        (address frToken, , ) = _fSale.getFractionInfo(itemId);
        require(frToken == address(0), "Cannot serialize fractional NFT");

        (uint256 tokenId, , address nftContract, , , ) = _market.getItemInfo(itemId);
        IERC721Metadata nft = IERC721Metadata(nftContract);
        require(msg.sender == nft.ownerOf(tokenId));
        string memory uri = nft.tokenURI(tokenId); //Retrieves token URI from original NFT contract

        ERC721Serialized eNft = new ERC721Serialized(numberOfEditions, msg.sender, _name, _symbol, uri);

        _idToSerializationInfo[itemId] = SerializedNFT({
            editions: numberOfEditions,
            nftContract: address(eNft),
            collectionCreator: msg.sender
        });

        emit NFTSerialized(address(eNft), msg.sender, block.timestamp);
    }

    //@notice Create stepped sale for entire serialized NFT collection
    //@param ID of item to create serialized sale from 
    //@param Sale start unix timestamp in seconds 
    //@param Sale end unix timestamp in seconds 
    //@param Base price
    //@param Price to be increased per sale 
    //@param Address of token to be used for sale
    function createSteppedSale(
        uint256 itemId, 
        uint256 _saleStartTime,
        uint256 _saleEndTime,
        uint256 _basePrice, 
        uint256 _stepPrice, 
        address _saleToken
    ) external {
        require(msg.sender == _idToSerializationInfo[itemId].collectionCreator, "Caller must be owner");
        require(_saleStartTime >= block.timestamp && _saleEndTime > _saleStartTime, "Invalid time");
        require(IERC721Metadata(_idToSerializationInfo[itemId].nftContract).isApprovedForAll(msg.sender, address(this)));
        require(_basePrice > 0 && _stepPrice > 0);
        
        _idToSteppedSale[itemId] = SteppedSale({
            saleStartTime: _saleStartTime,
            saleEndTime : _saleEndTime,
            basePrice: _basePrice,
            stepPrice: _stepPrice,
            totalSold: 0,
            saleToken: _market.isAcceptedToken(_saleToken) ? _saleToken : WBNB
        });
    }

    //@notice Returns current step price and next step price
    //@param Item ID 
    function getStepPrice(uint256 itemId) public view returns (uint256 currentStep, uint256 nextStep) {
        SteppedSale memory steppedSale = _idToSteppedSale[itemId];
        uint256 cStep = steppedSale.basePrice + (steppedSale.totalSold * steppedSale.stepPrice);

        return (cStep, cStep + steppedSale.stepPrice);
    }

    //@notice Purchase next edition from stepped sale
    //@dev Token IDs are distributed in reverse order
    //@param Item ID
    function purchaseEdition(uint256 itemId) external nonReentrant {
        SteppedSale memory s_sale = _idToSteppedSale[itemId];
        SerializedNFT memory s_info = _idToSerializationInfo[itemId];
        require(block.timestamp > s_sale.saleStartTime && block.timestamp < s_sale.saleEndTime, "Sale not active");

        (uint price, ) = getStepPrice(itemId);
        uint tokenId = s_info.editions - s_sale.totalSold;
        require(tokenId > 0, "Sold out");
        
        _idToSteppedSale[itemId].totalSold++;

        _transferFees(itemId, price, s_info.collectionCreator);
        IERC721Metadata(s_info.nftContract).safeTransferFrom(s_info.collectionCreator, msg.sender, tokenId);

        emit EditionPurchased(itemId, tokenId, price, block.timestamp, s_info.collectionCreator, msg.sender);
    }

    //@notice Splits sale amount and transfers to appropriate recipients
    function _transferFees(uint256 itemId, uint256 amount, address seller) private {
        IERC20 sToken = IERC20(_idToSteppedSale[itemId].saleToken);
        (, uint256 royaltyPercentage, , , address royaltyRecipient, ) = _market.getItemInfo(itemId);

        uint256 feeAmt = amount * _market.getMarketplaceFee() / 1000;
        uint256 royaltyAmt = amount * royaltyPercentage / 1000;

        sToken.safeTransferFrom(msg.sender, _market.owner(), feeAmt);
        if(royaltyAmt > 0) {
            sToken.safeTransferFrom(msg.sender, royaltyRecipient, royaltyAmt);
        }

        sToken.safeTransferFrom(msg.sender, seller, amount - (feeAmt + royaltyAmt));
    }
}
