
const { Wallet, Provider } = require('zksync-web3');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove } = require('./base/coin/token')
const { convertCSVToObjectSync, floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('./base/utils')
const { task1 } = require('./tasks/tasks1')
const ethers = require('ethers');



const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
const privateKey = 'cad2716ad3028c52712858b836af38b1f2e95de2d502eebba4876dd0e940811a';
const wallet = new Wallet(privateKey, provider, ethereumProvider);


// 打开钱包地址, 这两个参数需要配置
const walletPath = './TestWalletData.csv';
const maxGasPrice = 20;
const taskTag = 1


const walletData = convertCSVToObjectSync(walletPath);
let gasPrice;

;(
    async () => {
        console.log('开始循环...')
        for (wt of walletData) {


            // 循环获取gas
            while (true) {
                console.log('开始获取当前主网GAS');
                gasPrice = fixedToFloat(await ethereumProvider.getGasPrice(), 9);
                if (gasPrice > maxGasPrice) {
                    console.log('当前的gas为：', gasPrice, '大于', maxGasPrice,'，程序暂停10分钟');
                    await sleep(10);
                } else {
                    console.log('当前的gas为：', gasPrice, '小于', maxGasPrice,'，程序继续运行');
                    break;
                };
            };

            try {

                if ( taskTag = 1) {
                    task1(wallet);
                } else if (taskTag = 2) {
                    console.log(2)
                } else if (taskTag = 3) {
                    console.log(3)
                }

            } catch (error) {

                console.log(error)

            };


        };
    }
)();