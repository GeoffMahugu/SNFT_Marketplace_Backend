import { useQuery } from 'react-query';

import { ethers } from 'ethers';
import axios from 'axios';
import {
  nftaddress,
  nftmarketaddress,
  nftcollectionaddress,
  RPC_URL,
  ZERO_ADDRESS,
} from '../../../config';

import NFT from '../../../contracts/NFT.json';
import Market from '../../../contracts/NFTMarket.json';
import NFTAuction from '../../../contracts/NFTAuction.json';
import NFTCollections from '../../../contracts/NFTCollections.json';
import NFTSingleCollection from '../../../contracts/NFTSingleCollection.json';

export default function useFetchCollections(ownerAddress) {
  return useQuery(
    ['collections', ownerAddress],
    () => getAllCollectionsByOwnerAddress(ownerAddress),
    {
      enabled: ownerAddress !== undefined && ownerAddress !== '' && ownerAddress !== ZERO_ADDRESS,
    }
  );
}

const getAllCollectionsByOwnerAddress = async (ownerAddress) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const collectionContract = new ethers.Contract(
      nftcollectionaddress,
      NFTCollections.abi,
      provider
    );
    const data = await collectionContract.getCollectionByOwnerAddress(
      ownerAddress
    );
    console.log({ data });
    const items = await Promise.all(
      data.map(async (i) => {
        const singleColContract = new ethers.Contract(
          i.collectionAddress,
          NFTSingleCollection.abi,
          provider
        );
        const name = await singleColContract.name();
        const imageUrl = await singleColContract.imageUrl();
        const coverUrl = await singleColContract.coverUrl();
        return {
          name,
          imageUrl,
          coverUrl,
          collectionAddress: i.collectionAddress,
          itemId: i.itemId.toNumber(),
        };
      })
    );

    return items ? items : [];
  } catch (error) {
    console.log(error.message);
  }
};
