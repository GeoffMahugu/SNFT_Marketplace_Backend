// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract SNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    address private owner;
    bool public publicSale = false;
    address[] public _whitelistAddresses;


    constructor(address marketplaceAddress, address[] memory addresses) ERC721("Snifty NFT", "SNFT") {
        owner = msg.sender;
        contractAddress = marketplaceAddress;
        _whitelistAddresses = addresses;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        if(publicSale == false) {
            require(isAddressWhitelisted(msg.sender) == true, "Only whitelisted addresses can create tokens");
        }
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }  

    function transferOwnership(address _newOwner) external {
        require(msg.sender == owner);
        owner = _newOwner;
    }

    function startPublicSale() external {
        require(msg.sender == owner);
        publicSale = true;
    }

    function setApprovalAgain() public returns (bool) {
        setApprovalForAll(contractAddress, true);
        return true;
    }

    function getWhitelistedAddresses() public view returns (address[] memory) {
        return _whitelistAddresses;
    }
    function addWhitelistedAddress(address _address) public returns (bool) {
        require(msg.sender == owner, "Only owner can add whitelisted address");
        _whitelistAddresses.push(_address);
        return true;
    }

    function removeWhitelistedAddress(address _address) public {
        require(msg.sender == owner, "Only owner can remove whitelisted address");
        uint index = 0;
        bool found = false;
        for (uint i = 0; i < _whitelistAddresses.length; i++) {
            if (_whitelistAddresses[i] == _address) {
                index = i;
                found = true;
            }
        }
        require(found == true, "Address not found in whitelist");
        if (index >= _whitelistAddresses.length) return;
        delete _whitelistAddresses[index];

        for (uint i = index; i < _whitelistAddresses.length-1; i++){
            _whitelistAddresses[i] = _whitelistAddresses[i+1];
        }
        _whitelistAddresses.pop();
    }

    function isAddressWhitelisted(address _address) public view returns (bool) {
        for (uint i = 0; i < _whitelistAddresses.length; i++) {
            if (_whitelistAddresses[i] == _address) {
                return true;
            }
        }
        return false;
    }
}
