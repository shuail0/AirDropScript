// syncswaptest.js
const { Wallet, Provider } = require('zksync-web3');
const { convertCSVToObjectSync,generateRandomDomain  } = require('../base/utils.js')
const ethers = require('ethers');
const ZksNetwork = require('../protocol/zksync/nft/zksnetwork/zksnetwork.js'); // Corrected the import statement



const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';
const walletData = convertCSVToObjectSync(walletPath);
const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);


; (async ()=>{
    const wt = walletData[0];
    const wallet = new Wallet(wt.PrivateKey, provider, ethereumProvider);
    const zksNetwork = new ZksNetwork();
    const domainName = generateRandomDomain(7);
    console.log(domainName)
    const state = await zksNetwork.isDomainAvailable(wallet, domainName);
    if (state) {
        tx = await zksNetwork.registerDomain(wallet, domainName);
        console.log(tx);
    };
})();
