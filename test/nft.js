// const NFTMarket = artifacts.require('NFTMarket.sol');
// const NFT = artifacts.require('NFT.sol');

// contract('NFTMarket', () => {
//   let nftMarket = null;
//   let nft = null;
//   before(async () => {
//     nftMarket = await NFTMarket.deployed();
//     console.log(nftMarket.address);
//     const whitelistedAddresses = [
//       '0xd40a6c449e91f82c63ea690a477a870df6723507',
//       '0xba29206480c60fabb4843d280a4d04c77f185eec',
//     ];
//     nft = await NFT.deployed(nftMarket.address, whitelistedAddresses);
//   });

//   it('Should deploy the contract properly', async () => {
//     assert.ok(nftMarket.address);
//     assert.ok(nft.address);
//   });

//   it('Should fetch whitelisted addresses', async () => {
//     const addresses = await nft.getWhitelistedAddresses();
//     console.log(addresses);
//   });
//   it('Should check if address is whitelisted address', async () => {
//     const found = await nft.isAddressWhitelisted(
//       '0xd40a6c449e91f82c63ea690a477a870df6723507'
//     );
//     assert(found === true);
//   });
//   it('Should check if address is whitelisted address', async () => {
//     const found = await nft.isAddressWhitelisted(
//       '0xd40a6c449e91f82c63ea690a477a870df6723500'
//     );
//     assert(found === false);
//   });
//   it('Should create a token', async () => {
//     const t = await nft.createToken('New token uri');
//     console.log(t)
//   });
// });
