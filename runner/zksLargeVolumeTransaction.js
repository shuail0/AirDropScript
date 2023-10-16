

// stk 跨链执行程序

const { Wallet, Provider } = require('zksync-web3');
const { convertCSVToObjectSync, fixedToFloat, sleep, isValidPrivateKey, saveLog, getRandomFloat } = require('../base/utils');
const tasks = require('../tasks');
const ethers = require('ethers');
const CONFIG = require('../config/ZksLargeVolumeTrasactionConfig.json');

const {zskrpc, ethrpc, maxGasPrice, walletPath} = CONFIG 

const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
const walletData = convertCSVToObjectSync(walletPath);

// 获取gas
const checkGasPrice = async (ethereumProvider, maxGasPrice) => {
    let gasPrice;
    while (true) {
        console.log('开始获取当前主网GAS');
        gasPrice = fixedToFloat(await ethereumProvider.getGasPrice(), 9);
        if (gasPrice > maxGasPrice) {
            console.log('当前的gas为：', gasPrice, '大于', maxGasPrice,'，程序暂停10分钟');
            await sleep(10);  
        } else {
            console.log('当前的gas为：', gasPrice, '小于', maxGasPrice,'，程序继续运行');
            break;
        }
    }
    return gasPrice;
};
// 执行函数
const executeTask = async (taskTag, params) => {
    // 转换taskTag为字符串形式
    const taskName = 'task' + taskTag;
    // 检查任务是否存在
    if (typeof tasks[taskName] === 'function') {
        console.log('地址：', params.Address,' 开始执行任务：', taskName)
        await tasks[taskName](params);
    } else {
        console.log(`Task ${taskName} not found!`);

    }
};

;(
    async () => {
        console.log('开始循环...')
        for (wt of walletData) {
            wt.wallet = new Wallet(wt.PrivateKey, provider);
            // 循环获取gas
            await checkGasPrice(ethereumProvider, maxGasPrice)
            await executeTask(wt.taskTag, wt); // 根据taskTag执行对应的任务。

            // try {

            //     // 保存日志
            //     const currentTime = new Date().toISOString();
            //     const logMessage = `time:${currentTime}, walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}`;
            //     console.log(logMessage);
            //     saveLog('./logs/Sucess', logMessage);
            //     const sleepTime = getRandomFloat(5, 30)
            //     console.log(`任务结束，程序暂停${sleepTime}分钟`)
            //     await sleep(sleepTime);
            //     console.log('暂停结束')

            // } catch (error) {
            //     const currentTime = new Date().toISOString();
            //     const logMessage = `time:${currentTime}, walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}, error:${error}`;
            //     saveLog('./logs/Error', logMessage);
            // };


        };
    }
)();