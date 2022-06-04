
import { useQuery } from 'react-query'

import { ethers } from 'ethers';
import axios from 'axios';
import { nftaddress, nftmarketaddress, RPC_URL, ZERO_ADDRESS } from '../../../config';

import NFT from '../../../contracts/NFT.json';
import Market from '../../../contracts/NFTMarket.json';
import NFTAuction from '../../../contracts/NFTAuction.json';


export default function useFavorites() {
  return useQuery(['market_nfts'], () => getMarketPlaceNfts());
}

const getMarketPlaceNfts = async () => {
  console.log('FETCHING_________')
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
        data?.filter(i => i.tokenId.toString() !== '0').map(async (i) => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId);
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(), "ether");
            const auctionInfo = await getAuctionInfo(i.auction);
            let item = {
              price,
              itemId: i.itemId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              title: meta.data.title || meta.data.name,
              description: meta.data.description,
              isVideo: meta?.data?.isVideo,
              auction: i.auction,
              category: i.category,
              artist: i.artist,
              collectionAddress: i.collectionAddress,
              auctionInfo,
            };
            return item;
        })
    );

    return items ? items : [];
  } catch (error) {
    console.log(error.message);
  }
}


const getAuctionInfo = async (_auctionAddress) => {
  if(_auctionAddress === ZERO_ADDRESS) return null;
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const auctionContract = new ethers.Contract(
      _auctionAddress,
      NFTAuction.abi,
      provider
    );
    const highBid = await auctionContract.highestBid();
    const highBidder = await auctionContract.highestBidder();

    const endDate = await auctionContract.auctionEndDate();
    const allBids = await auctionContract.getAllBids();
    return { allBids, highBidder, highBid, endDate };
  } catch (error) {
    console.log(error);
    return null;
  }
};