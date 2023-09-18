// syncswaptest.js
const { Wallet, Provider } = require('zksync-web3');
const { convertCSVToObjectSync, floatToFixed } = require('../base/utils.js')
const ethers = require('ethers');
const ReactorFusion = require('../protocol/zksync/lending/reactorfusion/rectorfusion.js'); // Corrected the import statement



const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';
const walletData = convertCSVToObjectSync(walletPath);
const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);


; (async ()=>{
    const wt = walletData[0];
    const wallet = new Wallet(wt.PrivateKey, provider, ethereumProvider);
    const reactorfusion = new ReactorFusion();
    const amount = floatToFixed(0.001)
    // const tx = await reactorfusion.supplyEth(wallet, amount);
    // console.log(tx)

    // 还款
    const tx = await reactorfusion.repayEth(wallet, amount);
    console.log('交易成功 txHash:', tx.transactionHash);
})();
