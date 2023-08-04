// syncswaptest.js
const { Wallet, Provider } = require('zksync-web3');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js')
const { convertCSVToObjectSync,floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const Velocove = require('../protocol/dex/velocore/velocore.js'); // Corrected the import statement



const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';
const walletData = convertCSVToObjectSync(walletPath);
const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
const { getContract } = require( '../base/utils.js');


; (async ()=>{
    for (wt of walletData) {
        const wallet = new Wallet(wt.PrivateKey, provider, ethereumProvider);
        const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
        const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
        const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
        const balance = await getBalance(wallet, usdcAddress);
        console.log(balance.toString());

        const velocore = new Velocove();



        console.log('开始授权')
        await tokenApprove(wallet, usdplusAddress, velocore.routerAddr, balance);

        // console.log((await wallet.getGasPrice()).toString())

        console.log('开始交易')

        const tx = await velocore.swapTokenToEth(wallet, usdcAddress, wETHAddress, balance);
        console.log(tx);


        // const factoryAbi = require('../protocol/dex/syncswap/abi/BasePoolFactory.json')
        // const classicFactory = new ethers.Contract()
    }
})();
