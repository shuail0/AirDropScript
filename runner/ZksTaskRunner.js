const { Wallet, Provider } = require('zksync-web3');
const { convertCSVToObjectSync, fixedToFloat, sleep, appendObjectToCSV, saveLog, getRandomFloat, decryptUsingAESGCM } = require('../base/utils.js');
const tasks = require('../tasks');
const ethers = require('ethers');
const CONFIG = require('../config/ZksTaskRunnerConfig.json');
const readlineSync = require('readline-sync');
const fs = require('fs');
const crypto = require('crypto');

const provider = new Provider(CONFIG.zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(CONFIG.ethrpc);
const walletData = convertCSVToObjectSync(CONFIG.walletPath);
const pwd = readlineSync.question('Please enter your password: ', {
    hideEchoBack: true // 密码不回显
});


const logWithTime = async (filepath, message) => {
    const currentTime = new Date().toISOString();
    const fullMessage = `time:${currentTime}, ${message}`;
    console.log(fullMessage);
    saveLog(filepath, fullMessage);
};

async function checkGasPrice() {
    while (true) {
        console.log('开始获取当前主网GAS');
        try {
            const gasPrice = fixedToFloat(await ethereumProvider.getGasPrice(), 9);
            
            if (gasPrice <= CONFIG.maxGasPrice) {
                console.log(`当前的gas为：${gasPrice}，小于${CONFIG.maxGasPrice}，程序继续运行`);
                return gasPrice;
            }

            console.log(`当前的gas为：${gasPrice}，大于${CONFIG.maxGasPrice}，程序暂停10分钟`);
            await sleep(10); // 10 minutes
        } catch (error) {
            console.log('获取GAS价格失败，程序暂停1分钟后重新尝试');
            await sleep(1); // 1 minute
        }
    }
}

async function executeTask(taskTag, wt, ...args) {
    const taskName = `task${taskTag}`;

    if (typeof tasks[taskName] === 'function') {
        console.log(`地址：${wt.Address} 开始执行任务：${taskName}`);
        await tasks[taskName](wt, ...args);
    } else {
        console.log(`Task ${taskName} not found!`);
    }
}

async function processWallet(wt, ...args) {
    await checkGasPrice();
    try {
        const pky = decryptUsingAESGCM(wt.a, wt.e, wt.i, wt.s, pwd)
        wt.wallet = new Wallet(pky, provider, ethereumProvider);
        await executeTask(wt.taskTag, wt); 
        await logWithTime('../logs/Sucess', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}`);
        wt.time = new Date().toISOString();
        delete wt.wallet;
        await appendObjectToCSV(wt, '../logs/zksyncSucess.csv')
        const interval = getRandomFloat(CONFIG.minInterval, CONFIG.maxInterval)
        console.log(`任务完成，线程暂停${interval}分钟`);
        await sleep(interval);
        console.log('暂停结束');
    } catch (error) {
        await logWithTime('../logs/Error', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}, error:${error}`);
        wt.time = new Date().toISOString();
        wt.error = error;
        delete wt.wallet;
        await appendObjectToCSV(wt, '../logs/zksyncFail.csv')
    }
}

async function processQueue() {
    if (walletData.length === 0) return true;
    
    const wt = walletData.shift();
    await processWallet(wt, pwd);
    return processQueue();
}

(async function start() {
    const results = await Promise.all(
        Array.from({ length: Math.min(CONFIG.CONCURRENCY, walletData.length) }, processQueue)
    );

    if (results.every(res => res)) {
        console.log("All wallets have been processed.");
        process.exit(0);
    }
})();
