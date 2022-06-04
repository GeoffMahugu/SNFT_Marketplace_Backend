import React, { useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useFetchSigner } from '../hooks/users';
import { useQueryClient } from 'react-query';
import { createUser } from '../../services/Services';
import { errorToaster, successToaster } from './Toasts';
import { nftmarketaddress, connector } from '../../config';

// import WalletConnect from '@walletconnect/client';
// import QRCodeModal from '@walletconnect/qrcode-modal';

// // Create a connector
// const connector = new WalletConnect({
//   bridge: 'https://bridge.walletconnect.org', // Required
//   qrcodeModal: QRCodeModal,
// });

const Wallet = () => {
  const [con, setCon] = useState(null);
  const queryClient = useQueryClient();
  const { data: signerAddress } = useFetchSigner();
  console.log('signer address', signerAddress);

  const logOutHandler = async () => {
    connector.killSession();
    localStorage.removeItem('@signer');
    localStorage.removeItem('@walletconnect');
    queryClient.invalidateQueries('signer');
  };

  const connectMetamask = async () => {
    const rawMessage = 'I am signing in to MetaMask';
    // configure web3, e.g. with web3Modal or in your case WalletConnect
    const web3Modal = new Web3Modal();
    const web3 = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(web3);

    const signer = provider.getSigner();
    const address = await signer.getAddress();

    let signedMessage;
    if (web3.wc) {
      signedMessage = await provider.send('personal_sign', [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(rawMessage)),
        address.toLowerCase(),
      ]);
    } else {
      signedMessage = await signer.signMessage(rawMessage);
    }

    const verified = ethers.utils.verifyMessage(rawMessage, signedMessage);
    console.log('verified', verified, rawMessage, signedMessage);
    localStorage.setItem('@signer', verified);
    localStorage.setItem('@walletconnect', 'metamask');
    const res = await createUser(verified);

    if (res.status === 200) {
      const data = await res.json();

      if (data?.alreadyExist) {
        successToaster('User Exists');
      } else {
        successToaster('User Created');
      }
    } else {
      errorToaster('Fail To Save User Data');
    }
  };

  const connectWalletConnect = async () => {
    console.log('first');
    if (!connector.connected) {
      // create new session
      await connector.createSession();
      setCon(connector);

      // listen for events
      connector.on('connect', async (error, payload) => {
        if (error) {
          throw error;
        }

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('connected', accounts, chainId);
        localStorage.setItem('@signer', accounts[0]);
        localStorage.setItem('@walletconnect', 'walletconnect');
        queryClient.invalidateQueries('signer');
        const res = await createUser(accounts[0]);

        if (res.status === 200) {
          const data = await res.json();

          if (data?.alreadyExist) {
            successToaster('User Exists');
          } else {
            successToaster('User Created');
          }
        } else {
          errorToaster('Fail To Save User Data');
        }

        const message = 'I want to connect';
        const msgParams = [
          new Buffer(message).toString('hex'), // Required
          nftmarketaddress, // Required
        ];
        const result = await connector.signPersonalMessage(msgParams);
        console.log(result);
      });
      connector.on('disconnect', (error, payload) => {
        alert('disconnected');
      });
    } else {
      console.log('second');
      // connector.disconnect();
      const accts = await connector._accounts;
      console.log('accts', accts);
    }
  };

  return (
    <div className='row'>
      {signerAddress && (
        <div className='col-lg-3 mb30' onClick={logOutHandler}>
          <span className='box-url'>
            <span className='box-url-label'>Most Popular</span>
            <img src='./img/wallet/1.png' alt='' className='mb20' />
            <h4>Disconnect Wallet</h4>
            <p>Click to disconnect wallet.</p>
          </span>
        </div>
      )}

      {!signerAddress && (
        <div className='col-lg-3 mb30' onClick={connectMetamask}>
          <span className='box-url'>
            <span className='box-url-label'>Most Popular</span>
            <img src='./img/wallet/1.png' alt='' className='mb20' />
            <h4>Metamask</h4>
            <p>
              Start exploring blockchain applications in seconds. Trusted by
              over 1 million users worldwide.
            </p>
          </span>
        </div>
      )}

      {!signerAddress && (
        <div className='col-lg-3 mb30' onClick={connectWalletConnect}>
          <span className='box-url'>
            <img src='./img/wallet/2.png' alt='' className='mb20' />
            <h4>Trust Wallet</h4>
            <p>
              Bitski connects communities, creators and brands through unique,
              ownable digital content.
            </p>
          </span>
        </div>
      )}

      {/* <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/2.png' alt='' className='mb20' />
          <h4>Bitski</h4>
          <p>
            Bitski connects communities, creators and brands through unique,
            ownable digital content.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/3.png' alt='' className='mb20' />
          <h4>Fortmatic</h4>
          <p>
            Let users access your Ethereum app from anywhere. No more browser
            extensions.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/4.png' alt='' className='mb20' />
          <h4>WalletConnect</h4>
          <p>
            Open source protocol for connecting decentralised applications to
            mobile wallets.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/5.png' alt='' className='mb20' />
          <h4>Coinbase Wallet</h4>
          <p>
            The easiest and most secure crypto wallet. ... No Coinbase account
            required.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/6.png' alt='' className='mb20' />
          <h4>Arkane</h4>
          <p>
            Make it easy to create blockchain applications with secure wallets
            solutions.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <img src='./img/wallet/7.png' alt='' className='mb20' />
          <h4>Authereum</h4>
          <p>
            Your wallet where you want it. Log into your favorite dapps with
            Authereum.
          </p>
        </span>
      </div>

      <div className='col-lg-3 mb30'>
        <span className='box-url'>
          <span className='box-url-label'>Most Simple</span>
          <img src='./img/wallet/8.png' alt='' className='mb20' />
          <h4>Torus</h4>
          <p>
            Open source protocol for connecting decentralised applications to
            mobile wallets.
          </p>
        </span>
      </div> */}
    </div>
  );
};
export default Wallet;
