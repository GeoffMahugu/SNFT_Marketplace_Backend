import { useQuery } from 'react-query';

import { ethers } from 'ethers';
import { nftcollectionaddress, RPC_URL, ZERO_ADDRESS } from '../../../config';

import NFTCollections from '../../../contracts/NFTCollections.json';
import NFTSingleCollection from '../../../contracts/NFTSingleCollection.json';

export default function useFetchSingleCollection(_collectionAddress) {
  return useQuery(
    ['collection', _collectionAddress],
    () => getCollectionByCollectionAddress(_collectionAddress),
    {
      enabled: _collectionAddress && _collectionAddress !== ZERO_ADDRESS,
    }
  );
}

const getCollectionByCollectionAddress = async (_collectionAddress) => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const collectionContract = new ethers.Contract(
    nftcollectionaddress,
    NFTCollections.abi,
    provider
  );
  const data = await collectionContract.getCollectionByAddress(
    _collectionAddress
  );
  console.log({ data });
  if (data?.collectionAddress === ZERO_ADDRESS) {
    return null;
  } else {
    const singleColContract = new ethers.Contract(
      data.collectionAddress,
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
      collectionAddress: data.collectionAddress,
      itemId: data.itemId.toNumber(),
    };
  }
};
