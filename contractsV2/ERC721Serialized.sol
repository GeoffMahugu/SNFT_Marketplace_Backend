// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract ERC721Serialized is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private supply;

    string public baseURI;

    constructor(
        uint256 editions,
        address recipient,
        string memory _name,
        string memory _symbol,
        string memory _initBaseUri
    ) ERC721(_name, _symbol) {
        baseURI = _initBaseUri;
        _mintLoop(recipient, editions);
    }

    function _mintLoop(address _receiver, uint256 _mintAmount) internal {
        for (uint256 i = 0; i < _mintAmount; i++) {
            supply.increment();
            _safeMint(_receiver, supply.current());
        }
    }

    function totalSupply() public view returns (uint256) {
        return supply.current();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
        _exists(_tokenId),
        "ERC721Metadata: URI query for nonexistent token"
        );

        return baseURI;
    }
}
