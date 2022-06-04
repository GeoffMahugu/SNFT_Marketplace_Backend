var NFTCollections = artifacts.require(
  '../client/src/contracts/NFTCollections.sol'
);

module.exports = (deployer) => {
  deployer.deploy(NFTCollections).then(function () {
    console.log('NFTCollections', NFTCollections.address);
  });
};
