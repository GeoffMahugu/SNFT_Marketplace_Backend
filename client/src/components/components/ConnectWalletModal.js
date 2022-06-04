import React from 'react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { errorToaster, successToaster } from './Toasts'
import { createUser } from '../../services/Services'

export default function ConnectoToWallet({ displayModal }) {
  const connectMetamask = async () => {
    const rawMessage = 'I am signing in to MetaMask'
    // configure web3, e.g. with web3Modal or in your case WalletConnect
    const web3Modal = new Web3Modal()
    const web3 = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(web3)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    let signedMessage
    if (web3.wc) {
      signedMessage = await provider.send('personal_sign', [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(rawMessage)),
        address.toLowerCase()
      ])
    } else {
      signedMessage = await signer.signMessage(rawMessage)
    }
    const verified = ethers.utils.verifyMessage(rawMessage, signedMessage)
    console.log('verified', verified, rawMessage, signedMessage)
    localStorage.setItem('@signer', verified)
    const res = await createUser(verified)
    if (res.status === 200) {
      const data = await res.json()
      if (data?.alreadyExist) {
        successToaster('User Exists')
      } else {
        successToaster('User Created')
      }
    } else {
      errorToaster('Fail To Save User Data')
    }
  }
  return (
    <div className='checkout'>
      <div className='maincheckout'>
        <button className='btn-close' onClick={() => displayModal(false)}>
          x
        </button>
        <div className='heading'>
          <h3>Connect To Wallet</h3>
        </div>

        <div className='col-lg-8 mb30' onClick={connectMetamask}>
          <span className='box-url'>
            <span className='box-url-label'>Most Popular</span>
            <img src='/img/wallet/1.png' alt='' className='mb20' />
            <h4>Metamask</h4>
            <p>
              Start exploring blockchain applications in seconds. Trusted by
              over 1 million users worldwide.
            </p>
          </span>
        </div>
      </div>
    </div>
  )
}
