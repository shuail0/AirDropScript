// syncswaptest.js
const { Wallet, Provider } = require('zksync-web3');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js')
const { convertCSVToObjectSync,floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const Ezkalibur = require('../protocol/dex/ezkalibur/ezkalibur.js'); // Corrected the import statement



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


        const ezkalibur = new Ezkalibur();

        // 测试Eth兑换USDC （eth to token）
        // const amount = floatToFixed(0.001)
        // const tx = await ezkalibur.swapEthToToken(wallet, wETHAddress, usdcAddress, amount );
        // console.log(tx)

        // 测试 token 兑换token
        // const balance = await getBalance(wallet, usdcAddress);
        // console.log(balance.toString());
        const balance = floatToFixed(1, 6);
        console.log('开始授权')
        await tokenApprove(wallet, usdcAddress, ezkalibur.routerAddr, balance);
        console.log('开始交易')
        // const tx = await ezkalibur.swapTokenToToken(wallet, usdcAddress, usdplusAddress, balance);
        // console.log(tx)

        const tx = await ezkalibur.swapTokenToEth(wallet, usdcAddress, wETHAddress, balance);
        console.log(tx);


        // const factoryAbi = require('../protocol/dex/syncswap/abi/BasePoolFactory.json')
        // const classicFactory = new ethers.Contract()
    }
})();
