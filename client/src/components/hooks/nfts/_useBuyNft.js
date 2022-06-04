import { useQueryClient, useMutation } from 'react-query'

import { ethers, providers } from 'ethers'
import Web3Modal from 'web3modal'
import {
  nftmarketaddress,
  nftaddress,
  walletConnectProvider
} from '../../../config'
import Market from '../../../contracts/NFTMarket.json'
import { updateSellerAmount } from '../../../services/Services'
// import {navigate} from '@reach/router';
import { successToaster } from '../../components/Toasts'

export default function useBuyNft() {
  const queryClient = useQueryClient()

  const buyNft = async (nft) => {
    const isWalletConnectUser = localStorage.getItem('@walletconnect')
    if (isWalletConnectUser === 'metamask') {
      try {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          nftmarketaddress,
          Market.abi,
          signer
        )

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.createMarketSale(
          nftaddress,
          nft.itemId,
          {
            value: price
          }
        )
        await transaction.wait()
        successToaster('Purchased SuccessFully')
        return true
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
        const contract = new ethers.Contract(
          nftmarketaddress,
          Market.abi,
          signer
        )

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.createMarketSale(
          nftaddress,
          nft.itemId,
          {
            value: price
          }
        )
        await transaction.wait()
        successToaster('Purchased SuccessFully')
        return true
      } catch (error) {
        console.log(error)
      }
    }

    return false
  }
  return useMutation(buyNft, {
    onSuccess: async (res, variables, context) => {
      // successToaster('Purchased SuccessFully')
      console.log('onSuccess', res, variables, context)

      queryClient.refetchQueries(['market_nfts'])
      queryClient.refetchQueries(['market_nfts', variables?.itemId])
      queryClient.refetchQueries(['my_nfts'])
      if (res) {
        await updateSellerAmount(variables.seller, variables.price)
        queryClient.refetchQueries(['topSellers'])
      }
      // navigate('/Author');
    },
    onError: (err, variables, context) => {
      console.log(err)
    }
  })
}
