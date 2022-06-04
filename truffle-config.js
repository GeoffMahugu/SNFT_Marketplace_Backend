const path = require("path");   
const HDWalletProvider = require('@truffle/hdwallet-provider');
// create a file at the root of your project and name it .env -- there you can set process variables
// like the mnemomic and Infura project key below. Note: .env is ignored by git to keep your private information safe
// require('dotenv').config();
// const mnemonic = process.env['MNEMONIC'];

const acctPrivateKey =
  '3e741461e4e448920195c7dc5bb3f941183579f9b7c4c0a2692d776bbc070605';
const infuraUrl =
  'https://polygon-mumbai.infura.io/v3/a9fcb726b99141cba076a6f6e42bc757';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  networks: {
    develop: {
      port: 7545,
      host: '127.0.0.1',
      network_id: '*', // Match any network id
    },
    //polygon Infura testnet
    mumbai_testnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [acctPrivateKey],
          providerOrUrl: infuraUrl,
        }),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 80001,
    },
    //bsc Infura testnet
    bsc_testnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [
            '3e741461e4e448920195c7dc5bb3f941183579f9b7c4c0a2692d776bbc070605',
          ],
          providerOrUrl: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
        }),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      chainId: 97,
    },
  },
  compilers: {
    solc: {
      version: '0.8.10',
    },
  },
};
