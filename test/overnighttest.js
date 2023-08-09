// syncswaptest.js
const { Wallet, Provider } = require('zksync-web3');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js')
const { convertCSVToObjectSync,floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const Overnight = require('../protocol/zksync/overnight/overnight.js'); // Corrected the import statement




const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';
const walletData = convertCSVToObjectSync(walletPath);
const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
const { getContract } = require( '../base/utils.js');
const { constants } = require('starknet');


; (async ()=>{
    for (wt of walletData) {
        const wallet = new Wallet(wt.PrivateKey, provider, ethereumProvider);
        const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
        const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
        const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';


        const overnight = new Overnight();

        // 测试 Mint USD+
        // const balance = await getBalance(wallet, usdcAddress);
        // console.log(balance.toString());
        // const balance = floatToFixed(1, 6);
        // console.log('开始授权')
        // await tokenApprove(wallet, usdcAddress, overnight.exchangeAddr, balance);
        // console.log('开始mint USD+')
        // const tx = await overnight.mint(wallet, usdcAddress, balance);
        // console.log(tx)

        // 测试 销毁USD+
        const balance = floatToFixed(1, 6);
        console.log('开始授权')
        await tokenApprove(wallet, usdcAddress, overnight.exchangeAddr, balance);
        console.log('开始redeem USD+')
        const tx = await overnight.redeem(wallet, usdcAddress, balance);
        console.log(tx);


    }
})();
