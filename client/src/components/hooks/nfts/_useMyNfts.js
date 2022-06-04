import { useQuery } from 'react-query'

import { ethers, providers } from 'ethers'
import axios from 'axios'
import {
  nftaddress,
  nftmarketaddress,
  walletConnectProvider
} from '../../../config'

import NFT from '../../../contracts/NFT.json'
import Market from '../../../contracts/NFTMarket.json'
import Web3Modal from 'web3modal'

export default function useMyNfts() {
  return useQuery(['my_nfts'], () => getMyNfts())
}

const getMyNfts = async () => {
  const isWalletConnectUser = localStorage.getItem('@walletconnect')
  if (isWalletConnectUser === 'metamask') {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      )
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      const data = await marketContract.fetchMyNFTs()

      const items = await Promise.all(
        data
          ?.filter((i) => i.tokenId.toString() !== '0')
          .map(async (i) => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              itemId: i.itemId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              title: meta.data.title || meta.data.name,
              description: meta.data.description,
              isVideo: meta?.data?.isVideo,
              category: i.category,
              auction: i.auction
            }
            return item
          })
      )
      return items ? items : []
    } catch (error) {
      console.log(error)
      return []
    }
  } else {
    try {
      //  Enable session (triggers QR Code modal)
      await walletConnectProvider.enable('walletconnect')
      const c = walletConnectProvider.accounts

      const web3Provider = new providers.Web3Provider(walletConnectProvider)
      const signer = web3Provider.getSigner()

      console.log(signer, c)

      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      )
      const tokenContract = new ethers.Contract(
        nftaddress,
        NFT.abi,
        web3Provider
      )
      const data = await marketContract.fetchMyNFTs()

      const items = await Promise.all(
        data
          ?.filter((i) => i.tokenId.toString() !== '0')
          .map(async (i) => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
              price,
              tokenId: i.tokenId.toNumber(),
              itemId: i.itemId.toNumber(),
              seller: i.seller,
              owner: i.owner,
              image: meta.data.image,
              title: meta.data.title || meta.data.name,
              description: meta.data.description,
              isVideo: meta?.data?.isVideo,
              category: i.category,
              auction: i.auction
            }
            return item
          })
      )
      return items ? items : []
    } catch (error) {
      console.log(error)
      return []
    }
  }
}
