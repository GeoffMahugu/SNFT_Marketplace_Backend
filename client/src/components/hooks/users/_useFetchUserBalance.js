import { BASE_URL, NETWORK_ERROR } from '../../../constants/Constants'
import { useQuery } from 'react-query'
import { errorToaster } from '../../components/Toasts'
import { ethers, providers } from 'ethers'
import Web3Modal from 'web3modal'
import { walletConnectProvider } from '../../../config'

export default function useFetchUserBalance(_address) {
  return useQuery(
    ['user_balance', _address],
    () => fetchUserBalance(_address),
    {
      enabled: !!_address
    }
  )
}

const fetchUserBalance = async (_address) => {
  const isWalletConnectUser = localStorage.getItem('@walletconnect')
  if (isWalletConnectUser === 'metamask') {
    const web3Modal = new Web3Modal()
    const web3 = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(web3)
    const balance = await provider.getBalance(_address)
    console.log('balance', balance)
    return convertBigNumberToNormal(balance)
  } else {
    //  Enable session (triggers QR Code modal)
    await walletConnectProvider.enable('walletconnect')

    const web3Provider = new providers.Web3Provider(walletConnectProvider)
    const balance = await web3Provider.getBalance(_address)
    console.log('balance', balance)
    return convertBigNumberToNormal(balance)
  }
}

const convertBigNumberToNormal = (num) => {
  return ethers.utils.formatEther(num) // ethers.utils.formatUnits(num.toString(), 'ether');
}
