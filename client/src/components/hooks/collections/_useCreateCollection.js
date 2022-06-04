import { useQueryClient, useMutation } from 'react-query'

import { ethers, providers } from 'ethers'
import Web3Modal from 'web3modal'
import {
  nftmarketaddress,
  nftaddress,
  nftcollectionaddress,
  walletConnectProvider
} from '../../../config'
import Market from '../../../contracts/NFTMarket.json'
// import {navigate} from '@reach/router';
import NFTCollections from '../../../contracts/NFTCollections.json'
import NFTSingleCollection from '../../../contracts/NFTSingleCollection.json'
import { successToaster } from '../../components/Toasts'

export default function useCreateCollection() {
  const queryClient = useQueryClient()

  const createCollection = async (col) => {
    const { name, imageUrl, coverUrl } = col
    const isWalletConnectUser = localStorage.getItem('@walletconnect')
    if (isWalletConnectUser === 'metamask') {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const collectionContract = new ethers.Contract(
          nftcollectionaddress,
          NFTCollections.abi,
          signer
        )
        const transaction = await collectionContract.createCollection(
          name,
          imageUrl,
          coverUrl
        )
        let tx = await transaction.wait()
        successToaster('Collection created successfully')
        return tx
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        //  Enable session (triggers QR Code modal)
        await walletConnectProvider.enable('walletconnect')
        const c = walletConnectProvider.accounts

        const web3Provider = new providers.Web3Provider(walletConnectProvider)
        const signer = web3Provider.getSigner()
        const collectionContract = new ethers.Contract(
          nftcollectionaddress,
          NFTCollections.abi,
          signer
        )
        const transaction = await collectionContract.createCollection(
          name,
          imageUrl,
          coverUrl
        )
        let tx = await transaction.wait()
        successToaster('Collection created successfully')
        return tx
      } catch (error) {
        console.log(error)
      }
    }

    return false
  }
  return useMutation(createCollection, {
    onSuccess: async (res, variables, context) => {
      console.log('onSuccess', res, variables, context)
      const signerAddress = localStorage.getItem('@signer')
      queryClient.refetchQueries(['collections', signerAddress])
    },
    onError: (err, variables, context) => {
      console.log(err)
    }
  })
}
