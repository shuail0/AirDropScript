const { Wallet, Provider } = require('zksync-web3');
const { convertCSVToObjectSync, fixedToFloat, sleep, isValidPrivateKey, saveLog } = require('../base/utils');
const tasks = require('../tasks');
const ethers = require('ethers');
const CONFIG = require('../config/ZksTaskRunnerConfig.json');


const provider = new Provider(CONFIG.zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(CONFIG.ethrpc);
const walletData = convertCSVToObjectSync(CONFIG.walletPath);

const logWithTime = (filepath, message) => {
    const currentTime = new Date().toISOString();
    const fullMessage = `time:${currentTime}, ${message}`;
    console.log(fullMessage);
    saveLog(filepath, fullMessage);
};

async function checkGasPrice() {
    while (true) {
        console.log('开始获取当前主网GAS');
        const gasPrice = fixedToFloat(await ethereumProvider.getGasPrice(), 9);
        
        if (gasPrice <= CONFIG.maxGasPrice) {
            console.log(`当前的gas为：${gasPrice}，小于${CONFIG.maxGasPrice}，程序继续运行`);
            return gasPrice;
        }
        
        console.log(`当前的gas为：${gasPrice}，大于${CONFIG.maxGasPrice}，程序暂停10分钟`);
        await sleep(10);
    }
}

async function executeTask(taskTag, wallet, ...args) {
    const taskName = `task${taskTag}`;

    if (typeof tasks[taskName] === 'function') {
        console.log(`地址：${wallet.address} 开始执行任务：${taskName}`);
        await tasks[taskName](wallet, ...args);
    } else {
        console.log(`Task ${taskName} not found!`);
    }
}

async function processWallet(wt) {
    if (!isValidPrivateKey(wt.PrivateKey)) {
        logWithTime('./logs/Error', `Invalid private key for wallet: ${wt.Wallet}`);
        return;
    }
    
    const wallet = new Wallet(wt.PrivateKey, provider, ethereumProvider);
    await checkGasPrice();

    try {
        await executeTask(wt.taskTag, wallet); 
        logWithTime('../logs/Sucess', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}`);
        
        console.log(`任务完成，线程暂停${CONFIG.sleepDuration}分钟`);
        await sleep(CONFIG.sleepDuration);
        console.log('暂停结束');
    } catch (error) {
        logWithTime('../logs/Error', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}, error:${error}`);
    }
}

async function processQueue() {
    if (walletData.length === 0) return true;
    
    const wt = walletData.shift();
    await processWallet(wt);
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
