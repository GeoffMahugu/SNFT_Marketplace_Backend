// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ERC721Minter is ERC721URIStorage, EIP712, AccessControl {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public constant MARKETPLACE_CONTRACT = 0xF1371dCfB5241D2FaD42D4B38af29675C7A3eBa5; //Testnet address. Change for mainnet
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct NFTVoucher{
        uint256 tokenId;
        string uri;
    }

    modifier minterOnly {
        require(hasRole(MINTER_ROLE, msg.sender), "Unauthorized");
        _;
    }

    constructor() ERC721("Snifty", "SNFT") EIP712("Snifty-Lazy", "1") {
        _grantRole(MINTER_ROLE, MARKETPLACE_CONTRACT);
    }
    
    function mintToken(
        address recipient, 
        string memory tokenUri
    ) external minterOnly returns (uint256) {
        _tokenIds.increment();
        uint256 currentId = _tokenIds.current();
        _mint(recipient, currentId);
        _setTokenURI(currentId, tokenUri);
        return currentId;
    }

    function redeem(address redeemer, NFTVoucher calldata voucher, bytes memory signature) external returns (uint256) {
        address signer = _verify(voucher, signature);
        require(hasRole(MINTER_ROLE, signer), "Signature invalid or unauthorized");

        _mint(signer, voucher.tokenId);
        _setTokenURI(voucher.tokenId, voucher.uri);
        _transfer(signer, redeemer, voucher.tokenId);

        return voucher.tokenId;
    }
    function _hash(NFTVoucher calldata voucher) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
        keccak256("NFTVoucher(uint256 tokenId,string uri)"),
        voucher.tokenId,
        keccak256(bytes(voucher.uri))
        )));
    }

    function _verify(NFTVoucher calldata voucher, bytes memory signature) internal view returns (address) {
        bytes32 digest = _hash(voucher);
        return digest.toEthSignedMessageHash().recover(signature);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override (AccessControl, ERC721) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }

    function approveMarketplace() external {
        setApprovalForAll(MARKETPLACE_CONTRACT, true);
    }
}
