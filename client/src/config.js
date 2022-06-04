import WalletConnect from '@walletconnect/client'
import QRCodeModal from '@walletconnect/qrcode-modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

// Create a connector
export const connector = new WalletConnect({
  bridge: 'https://bridge.walletconnect.org', // Required
  qrcodeModal: QRCodeModal
})

//deployed
export const nftaddress = '0x63CC1378f8dB8b37171052f17adD094227A0ec35'
export const nftmarketaddress = '0x8bD414887A4A45fa634BCf36D3148C0d299eE15a'
export const nftcollectionaddress = '0x89733B7360080d6f0D0a901f78Ae8e7915c3c756'
export const RPC_URL = 'https://data-seed-prebsc-2-s2.binance.org:8545/'

export const POLYGONSCAN_URL = 'https://testnet.bscscan.com'

//local
// export const nftaddress = '0x58ec570527c508507f8185766D9Bb6a961B2CaeC';
// export const nftmarketaddress = '0xC2F5eCa37c184E75F261484e12A38cCAC31Be414';
// export const nftcollectionaddress = '0x58ec570527c508507f8185766D9Bb6a961B2CaeC';
// export const RPC_URL = 'http://localhost:7545';

export const unit = 'BNB'
export const feePercent = 1

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// provider
export const walletConnectProvider = new WalletConnectProvider({
  infuraId: '27e484dcd9e3efcfd25a83a78777cdf1',
  rpc: {
    56: 'https://bsc-dataseed.binance.org/',
    97: 'https://data-seed-prebsc-2-s2.binance.org:8545/'
  },
  qrcode: true,
  qrcodeModalOptions: {
    mobileLinks: ['metamask', 'trust'],
    desktopLinks: ['encrypted ink']
  }
})
