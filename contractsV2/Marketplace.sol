// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./interfaces/IERC721Minter.sol";

contract Marketplace is Ownable, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;

    struct Item {
        uint256 tokenId;
        uint256 royaltyPercentage;
        address nftContract;
        address currentOwner;
        address royaltyRecipient;
        bool saleOngoing;
    }
    
    struct Trade {
        address from;
        address to;
        uint256 amount;
        uint256 price;
        uint256 tradeTime;
    }
    
    uint256 private _marketplaceFeePercentage = 25;
    uint256 private _royaltyPercentageDefault = 75;
    
    address public ERC721Minter;
    bytes32 public merkleRoot;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTERED_CALLER_ROLE = keccak256("REGISTERED_CALLER_ROLE"); //Can call setter functions and modify data in this contract

    string private constant MUST_BE_TOKEN_OWNER = "You are not the token owner";
    bool public adminMint = true;
    bool public whitelistPresale = false;
    address[] private _acceptedTokens = [0x2170Ed0880ac9A755fd29B2688956BD959F933F8, 0xCC42724C6683B7E57334c4E856f4c9965ED682bD, 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d, 0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3];
    //WETH, MATIC, USDC, DAI Mainnet addresses --- CHANGE AS REQUIRED

    mapping(uint256 => Item) private _idToItem; 
    mapping(address => bool) private _isBlacklisted;
    mapping(address => mapping(uint256 => uint256)) private _tokenToItemId;
    mapping(uint256 => string) private _idToUnlockableContent;
    mapping(uint256 => Trade[]) private _idToTradeHistory;

    modifier notListedForSale(uint256 itemId) {
        require(_idToItem[itemId].saleOngoing == false, "Item listed for sale");
        _;
    }

    modifier notBlacklisted {
        require(!_isBlacklisted[msg.sender], "User blacklisted");
        _;
    }
    
    modifier registeredCaller {
        require(hasRole(REGISTERED_CALLER_ROLE, msg.sender), "Unauthorized");
        _;
    }
    
    modifier minterSet {
        require(ERC721Minter != address(0), "Minter contract uninitialized");
        _;
    }

    //Grants default admin role to contract creator/owner
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    //@dev Transfer owner role to a different non-zero address
    //Default admin role is also transferred to new owner and revoked from previous owner
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _transferOwnership(newOwner);
    }

    //@notice Updates the merkle root
    //Caller must be admin
    function setMerkleRoot(bytes32 _merkleRoot) external onlyRole(ADMIN_ROLE) {
        merkleRoot = _merkleRoot;
    }

    //@notice Grants admin privileges to given addresses --- Owner only
    function grantAdminRole(address[] memory _admins) external onlyOwner {
        for(uint i=0; i<_admins.length; i++) {
            _grantRole(ADMIN_ROLE, _admins[i]);
        }
    }

    function isRegisteredCaller(address caller) external view returns (bool) {
        return hasRole(REGISTERED_CALLER_ROLE, caller);
    }

    //@notice Returns if an input token is in the accepted tokens list
    function isAcceptedToken(address token) external view returns (bool) {
        for(uint i=0; i<_acceptedTokens.length; i++) {
            if(_acceptedTokens[i] == token) {
                return true;
            }
        }
        return false;
    }

    function blacklistUser(address user) external onlyRole(ADMIN_ROLE) {
        _isBlacklisted[user] = true;
    }

    function removeUserFromBlacklist(address user) external onlyRole(ADMIN_ROLE) {
        _isBlacklisted[user] = false;
    }

    //@notice Make minting open to all --- Owner only
    function enablePublicMint() external onlyOwner {
        require(whitelistPresale, "Enable WL mint first");
        whitelistPresale = false;
    }

    //@notice Enable minting for whitelisted addresses --- Owner only
    function enableWhitelistMint() external onlyOwner {
        adminMint = false;
        whitelistPresale = true;
    }

    function getItemForSale(uint256 itemId) external view returns (bool) {
        return _idToItem[itemId].saleOngoing;
    }

    function setItemForSale(uint256 itemId, bool saleState) external registeredCaller {
        _idToItem[itemId].saleOngoing = saleState;
    }

    function getItemOwner(uint256 itemId) external view returns (address) {
        return _idToItem[itemId].currentOwner;
    } 
    
    function setItemOwner(uint256 itemId, address newOwner) external registeredCaller {
        _idToItem[itemId].currentOwner = newOwner;
    }

    function getBlacklisted(address user) external view returns (bool) {
        return _isBlacklisted[user];
    }

    function getUnlockableContent(uint256 itemId) external view returns (string memory) {
        require(msg.sender == _idToItem[itemId].currentOwner, "Only item owner can view this");
        return _idToUnlockableContent[itemId];
    }

    //@dev Sets minter contract and grants registered caller roles to standardSale, auction and fractionalSale contract addresses
    function setRegisteredContracts(
        address _minterContract,
        address _standardSaleContract,
        address _auctionContract,
        address _fractionalSaleContract
    ) external onlyRole(ADMIN_ROLE) {
        ERC721Minter = _minterContract;
        _grantRole(REGISTERED_CALLER_ROLE, _standardSaleContract);
        _grantRole(REGISTERED_CALLER_ROLE, _auctionContract);
        _grantRole(REGISTERED_CALLER_ROLE, _fractionalSaleContract);
    }

    function getMarketplaceFee() external view returns (uint256) {
        return _marketplaceFeePercentage;
    }

    //@notice Returns data about given item ID
    function getItemInfo(uint256 itemId) external view 
    returns 
    (uint256 tokenId, uint256 royaltyPercentage, address nftContract, address currentOwner, address royaltyRecipient, bool saleOngoing) {
        Item memory i = _idToItem[itemId];
        return (i.tokenId, i.royaltyPercentage, i.nftContract, i.currentOwner, i.royaltyRecipient, i.saleOngoing);
    }

    function hasBeenListed(address nft, uint256 tokenId) external view returns (bool) {
        return _tokenToItemId[nft][tokenId] == 0 ? false : true;
    }

    //@notice Creates a new trade for an item ID
    //Caller must be a registered smart contract
    function addTrade(
        uint256 itemId, 
        address _from, 
        address _to, 
        uint256 _amount,
        uint256 _price
    ) external registeredCaller {
        _idToTradeHistory[itemId].push(Trade(_from, _to, _amount, _price, block.timestamp));
    }

    function _isERC1155(address nftContract) private view returns (bool) {
        return IERC1155(nftContract).supportsInterface(0xd9b67a26);
    }

    //@notice Lists an existing NFT
    //@param Token ID of NFT
    //@param Royalty percentage multiplied by 10
    //@param Contract address of NFT collection
    //@param Royalty recipient address
    //@param Unlockable content url - optional
    //@return Item ID of the newly listed NFT
    function listItem(
        uint256 _tokenId,
        uint256 _royaltyPercentage,
        address _nftContract,
        address _royaltyRecipient,
        string memory _unlockableContent
    ) public notBlacklisted returns (uint256) {
        require(_tokenToItemId[_nftContract][_tokenId] == 0, "Item already listed");
        if(_isERC1155(_nftContract)) {
            require(IERC1155(_nftContract).balanceOf(msg.sender, _tokenId) >= 1);
        }else {
            require(msg.sender == IERC721(_nftContract).ownerOf(_tokenId), MUST_BE_TOKEN_OWNER);
        }
        
        _itemIds.increment();
        uint256 currentId = _itemIds.current();
        _tokenToItemId[_nftContract][_tokenId] = currentId;

        _idToItem[currentId] = Item({
            tokenId: _tokenId,
            royaltyPercentage: _royaltyRecipient != address(0) && _royaltyPercentage == 0 ? _royaltyPercentageDefault : _royaltyPercentage,
            nftContract: _nftContract,
            currentOwner: msg.sender,
            royaltyRecipient: _royaltyRecipient,
            saleOngoing: false
        });

        _idToUnlockableContent[currentId] = _unlockableContent;
        return currentId;
    }

    function getTradeHistory(uint256 itemId) external view returns (Trade[] memory) {
        return _idToTradeHistory[itemId];
    } 

    //@notice Mints a new NFT and then lists it on the marketplace --- For admin and WL only
    //@param Merkle proof --- verified only during WL presale
    //@param Royalty percentage multiplied by 10
    //@param Royalty recipient address
    //@param URI containing the metadata of the NFT
    //@param Unlockable content url - optional
    //@return Item ID of the newly listed NFT
    function mintThenListItemRestricted(
        bytes32[] calldata _merkleProof,
        uint256 _royaltyPercentage,
        address _royaltyRecipient,
        string memory _tokenUri,
        string memory _unlockableContent
    ) external notBlacklisted minterSet returns (uint256) {
        if(adminMint) {
            require(hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        } else if(whitelistPresale) {
            require(MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "Invalid proof");
        }

        uint256 tokenId = IERC721Minter(ERC721Minter).mintToken(msg.sender, _tokenUri);
        uint256 itemId = listItem(tokenId, _royaltyPercentage, ERC721Minter, _royaltyRecipient, _unlockableContent);

        return itemId;
    }

    //@notice Mints a new NFT and then lists it on the marketplace --- Public
    //Only accessible after admin mint and WL mint has ended
    function mintThenListItemPublic(
        uint256 _royaltyPercentage,
        address _royaltyRecipient,
        string memory _tokenUri,
        string memory _unlockableContent
    ) external notBlacklisted minterSet returns (uint256) {
        require(!adminMint && !whitelistPresale, "Public mint not started yet");
        uint256 tokenId = IERC721Minter(ERC721Minter).mintToken(msg.sender, _tokenUri);
        uint256 itemId = listItem(tokenId, _royaltyPercentage, ERC721Minter, _royaltyRecipient, _unlockableContent);

        return itemId;
    }

    //@notice Remove a listed item from the marketplace
    //@dev Caller must be item owner or admin
    function unlistItem(uint256 itemId) external {
        require(_idToItem[itemId].saleOngoing == false);
        require(msg.sender == _idToItem[itemId].currentOwner || hasRole(ADMIN_ROLE, msg.sender));
        delete _idToItem[itemId];
    }
    
    //@dev Transfers given NFT to zero address
    //@param ID of item to burn
    //@param Amount of tokens to burn, only applicable for ERC1155
    function burnItem(uint256 itemId, uint256 amount) external {
        require(msg.sender == _idToItem[itemId].currentOwner);
        require(amount > 0);
        address _nftContract = _idToItem[itemId].nftContract;
        if(_isERC1155(_nftContract) == false) {
            require(amount == 1);
            IERC721(_nftContract).safeTransferFrom(msg.sender, address(0), _idToItem[itemId].tokenId);
        }else {
            IERC1155(_nftContract).safeTransferFrom(msg.sender, address(0), _idToItem[itemId].tokenId, amount, "");
        }
    }

    function updateItemOwner(uint256 itemId) external {
        _idToItem[itemId].currentOwner = IERC721(_idToItem[itemId].nftContract).ownerOf(_idToItem[itemId].tokenId);
    }
    
    //@notice Transfers a listed NFT to another address
    //@dev NFT contract must be ERC721, caller must be item owner and item must not be listed for sale
    //@param Item ID to gift
    //@param Address that should receive the NFT
    function giftItemERC721(
        uint256 itemId, 
        address recipient
    ) external notBlacklisted notListedForSale(itemId) {
        require(msg.sender == _idToItem[itemId].currentOwner, MUST_BE_TOKEN_OWNER);
        _idToItem[itemId].currentOwner = recipient;
        _idToTradeHistory[itemId].push(Trade(msg.sender, recipient, 1, 0, block.timestamp));

        IERC721(_idToItem[itemId].nftContract).safeTransferFrom(msg.sender, recipient, _idToItem[itemId].tokenId); //...
    }

    //@notice Transfers an amount of listed ERC1155 NFT to another address
    //@dev NFT contract must be ERC1155, caller must be item owner and item must not be listed for sale
    //@param Item ID to gift
    //@param Amount of tokens to gift
    //@param Address that should receive the NFTs
    function giftItemERC1155(
        uint256 itemId, 
        uint256 amount,
        address recipient
    ) external notBlacklisted notListedForSale(itemId) {
        require(msg.sender == _idToItem[itemId].currentOwner, MUST_BE_TOKEN_OWNER);
        _idToItem[itemId].currentOwner = recipient;
        _idToTradeHistory[itemId].push(Trade(msg.sender, recipient, amount, 0, block.timestamp));

        IERC1155(_idToItem[itemId].nftContract).safeTransferFrom(msg.sender, recipient, _idToItem[itemId].tokenId, amount, ""); //...
    }

    //@notice Change marketplace fee percentage --- Owner only
    function updateMarketplaceFee(uint256 newMarketplaceFeePercentage) external onlyOwner {
        _marketplaceFeePercentage = newMarketplaceFeePercentage;
    }
    
    //@notice Change default royalty percentage --- Admin only
    function updateDefaultRoyaltyFee(uint256 newDefaultRoyalty) external onlyRole(ADMIN_ROLE) {
        _royaltyPercentageDefault = newDefaultRoyalty;
    }

}
