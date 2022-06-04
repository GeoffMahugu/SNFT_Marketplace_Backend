// const NFTMarket = artifacts.require('NFTMarket.sol');
// const NFT = artifacts.require('NFT.sol');

// const ethers = require('ethers');

// contract('NFTMarket', () => {
//   let nftMarket = null;
//   let nft = null;

//   before(async () => {
//     nftMarket = await NFTMarket.deployed();
//     console.log(nftMarket.address);
//     nft = await NFT.deployed(nftMarket.address);
//   });

//   it('Should deploy the contract properly', async () => {
//     assert.ok(nftMarket.address);
//     assert.ok(nft.address);
//   });

//   it('Should fetch market items', async () => {
//     const items = await nftMarket.fetchMarketItems();
//     // console.log(items);
//   });

//   it('Should mint and add an item to marketplace', async () => {
//     const url = 'testing url';
//     let tokenId = await nft.createToken(url);
//     // console.log('transaction', tokenId);
//     const percent = 200 * 0.01;
//     // const listingPrice = ethers.utils.parseUnits(percent.toString(), 'ether');
//     // console.log('first', ethers.utils.formatEther(listingPrice), percent);
//     const nftPrice = 200;
//     const itemPrice = ethers.utils.parseUnits(nftPrice?.toString(), 'ether');
//     // console.log(itemPrice);
//     const listingPrice = await nftMarket.getListingPriceByItemPrice(itemPrice);
//     console.log(listingPrice.toString());
//     console.log('first', ethers.utils.formatEther(listingPrice.toString()), percent);
//     // const listingPrice = await nftMarket.getListingPrice();
//     const tx = await nftMarket.createMarketItem(
//       nft.address,
//       1,
//       itemPrice,
//       true,
//       0,
//       '2022-10-10',
//       'All',
//       '0x0ebe109b4AC5De65d63F7D7e5A856dcd77dC58fD',
//       { value: listingPrice }
//     );
//   });

//   it('Should mint and add an item to marketplace', async () => {
//     const url = 'testing url';
//     let tokenId = await nft.createToken(url);
//     // console.log('transaction', tokenId);
//     const percent = 200 * 0.01;
//     // const listingPrice = ethers.utils.parseUnits(percent.toString(), 'ether');
//     // console.log('first', ethers.utils.formatEther(listingPrice), percent);
//     const nftPrice = 200;
//     const itemPrice = ethers.utils.parseUnits(nftPrice?.toString(), 'ether');
//     // console.log(itemPrice);
//     const listingPrice = await nftMarket.getListingPriceByItemPrice(itemPrice);
//     console.log(listingPrice.toString());
//     console.log(
//       'first',
//       ethers.utils.formatEther(listingPrice.toString()),
//       percent
//     );
//     // const listingPrice = await nftMarket.getListingPrice();
//     const tx = await nftMarket.createMarketItem(
//       nft.address,
//       2,
//       itemPrice,
//       true,
//       0,
//       '2022-10-10',
//       'All',
//       '0x77522333Da871396C5254dE263781E9125e59Afe',
//       { value: listingPrice }
//     );
//   });
  
//   // it('Should fetch market items again', async () => {
//   //   const items = await nftMarket.fetchMarketItems();
//   //   console.log(items);
//   // });

//   it('Should fetch market items by collection', async () => {
//     const items = await nftMarket.fetctNFTsByCollection(
//       '0x0ebe109b4AC5De65d63F7D7e5A856dcd77dC58fD'
//     );
//     console.log("ININININI", items);
//   });
//   // it('Should fetch market item by id', async () => {
//   //   const item = await nftMarket.getItemByID(1);
//   //   console.log(item);
//   //   assert(Number(item[0]) === 1);
//   // });
//   // it('Should fetch market item by category', async () => {
//   //   const item = await nftMarket.fetctNFTsByCatgory('Featured');
//   //   console.log(item);
//   //   assert(item[0].category === 'Featured');
//   // });
//   it('Should buy the item and transfer the ownership', async () => {
//     const item = await nftMarket.getItemByID(1);
//     // const percent = item.price * 0.01;
//     // const listingPrice = ethers.utils.parseUnits(percent.toString(), 'ether');
//     const listingPrice = await nftMarket.getListingPriceByItemPrice(item.price);
//     const sale = await nftMarket.createMarketSale(
//       nft.address,
//       item.itemId,
//       { value: item.price }
//     );
//     // console.log(sale);
//   });
//   // it('Should have changed item to sold', async () => {
//   //   const item = await nftMarket.getItemByID(1);
//   //   assert(item.sold === true);
//   // });
//   // it('Should fetch market items again!', async () => {
//   //   const items = await nftMarket.fetchMarketItems();
//   //   console.log(items);
//   // });

//   // it('Should resale the bought item', async () => {
//   //   // const listingPrice = await nftMarket.getListingPrice();
//   //   const percent = 13 * 0.01;
//   //   const listingPrice = ethers.utils.parseUnits(percent.toString(), 'ether');
//   //   await nftMarket.resaleBoughtItem(
//   //     nft.address,
//   //     1,
//   //     13,
//   //     false,
//   //     0,
//   //     '22-10-2022',
//   //     {
//   //       value: listingPrice,
//   //     }
//   //   );
//   //   const item = await nftMarket.getItemByID(1);
//   //   console.log(item);
//   //   assert(item.sold === false);
//   // });
//   // // it('Should fetch market items again!', async () => {
//   // //   const items = await nftMarket.fetchMarketItems();
//   // //   // console.log(items);
//   // // });

//   // it('Should buy the item again!', async () => {
//   //   const item = await nftMarket.getItemByID(1);
//   //   const percent = item.price * 0.01;
//   //   const listingPrice = ethers.utils.parseUnits(percent.toString(), 'ether');
//   //   const sale = await nftMarket.createMarketSale(
//   //     nft.address,
//   //     item.itemId,
//   //     listingPrice,
//   //     {
//   //       value: item.price,
//   //     }
//   //   );
//   //   // console.log(sale);
//   // });
//   // it('Should fetch market items again!', async () => {
//   //   const items = await nftMarket.fetchMarketItems();
//   //   console.log(items);
//   // });
//   // it('Should resale the bought in auction item', async () => {
//   //   const listingPrice = await nftMarket.getListingPrice();
//   //   await nftMarket.resaleBoughtItem(
//   //     nft.address,
//   //     1,
//   //     13,
//   //     true,
//   //     200,
//   //     '22-10-2022',
//   //     {
//   //       value: listingPrice,
//   //     }
//   //   );
//   //   const item = await nftMarket.getItemByID(1);
//   //   console.log(item);
//   //   assert(item.sold === false);
//   // });
//   // it('Should fetch market items again!', async () => {
//   //   const items = await nftMarket.fetchMarketItems();
//   //   console.log(items);
//   // });
// });
