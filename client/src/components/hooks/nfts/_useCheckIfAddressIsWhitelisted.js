import { useQuery } from 'react-query';

import { ethers } from 'ethers';
import { nftaddress, RPC_URL } from '../../../config';

import NFT from '../../../contracts/NFT.json';

export default function useCheckIfAddressIsWhitelisted(_address) {
  return useQuery(['isWhitelisted', _address], () =>
    checkIfAddressIsWhitelisted(_address),
    {
        enabled: _address !== '',
    }
  );
}

const checkIfAddressIsWhitelisted = async (_address) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);

    const data = await tokenContract.isAddressWhitelisted(_address);
    console.log('data', data);
    return data
  } catch (error) {
    console.log(error.message);
  }
};
