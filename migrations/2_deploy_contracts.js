var NFT = artifacts.require('../client/src/contracts/NFT.sol');
var NFTMarket = artifacts.require('../client/src/contracts/NFTMarket.sol');
var NFTCollections = artifacts.require('../client/src/contracts/NFTCollections.sol');


module.exports = (deployer) => {
  deployer.deploy(NFTMarket).then(function () {
    console.log('MARKET INININININININ', NFTMarket.address);
    // deployer.deploy(NFTCollections).then(function () {
    //   console.log('Collections', NFTCollections.address);
    // });
    return deployer.deploy(NFT, NFTMarket.address);
  });
};
