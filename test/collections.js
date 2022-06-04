const NFTCollections = artifacts.require('NFTCollections.sol');

contract('NFTCollections', ([acct1]) => {
  let nftCollections = null;
  console.log({acct1});
  before(async () => {
    nftCollections = await NFTCollections.deployed();
    console.log(nftCollections.address);
  });

  it('Should deploy the contract properly', async () => {
    assert.ok(nftCollections.address);
  });

  it('Should add a collection', async () => {
    const item = await nftCollections.createCollection('Col1', 'image', 'cover');
    const item1 = await nftCollections.createCollection(
      'Col1',
      'image',
      'cover'
    );

  });

  it('Should fetch all collections', async () => {
    const items = await nftCollections.getAllCollections();
    console.log(items);
  });
it('Should fetch collections by owner', async () => {
  const items = await nftCollections.getCollectionByOwnerAddress(acct1);
  console.log(items);
});
  

});
