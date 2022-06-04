Before all that you must have to install nodejs and truffle suite. To install truffle. `run npm install -g truffle`

#backend 
1. `run npm install`
2. contracts are under the contracts folder (.sol files)
3. To compile all contracts run sudo truffle compile
4. Once compiled, now your contracts are ready to deploy
3. 2_deploy_contracts is under migrations

#Deployment 1. To deploy it on polygon testnet, we need test matic to made our transactions
here you can get testmatic from their faucet [Polygon Faucet](https://faucet.polygon.technology/).
Go to metamask > add a network then add testnet account to get those testnet matic's.
Remember to use same RPC URL as you are going to use same RPC URL on client side as well. eg.
`https://matic-mumbai.chainstacklabs.com` If you have used this RPC to deploy your contracts then you must replace this RPC URL in client/src/config.js file
 2. Once you have test matic, then replace the private key of that test matic account with the acctPrivateKey in truffle-config.js file.
 
const acctPrivateKey = '1ffd7c797c277a1fcbb68407ae89e50e46453f19291ee09535e8fb2e7ac999d2';
3. You need to have account on infura where you have to select for polygon testnet. Replace that infuraUrl in truffle-config.js file.
4. Once that is done, now you can deploy your contract. 5. Run sudo truffle deploy --network mumbai_testnet. It will smoothly deploy your contracts if you have sufficient test matic.
6. Once deployed you will get contract addresses against all deployed contracts, you have to copy those and replace with the nftmarketaddress and nftaddress in config.js file in clients folder.

#Frontend 1. located in client folder
2. `cd client && npm install`
3. `npm run dev`
4. now server is running on localhost:3000