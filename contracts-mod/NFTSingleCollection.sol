pragma solidity ^0.8.10;

contract NFTSingleCollection {
    string public imageUrl;
    string public coverUrl;
    string public name;
    constructor(
        string memory _name,
        string memory _imageUrl,
        string memory _coverUrl
    ) {
        name = _name;
        imageUrl = _imageUrl;
        coverUrl = _coverUrl;
    }
}
