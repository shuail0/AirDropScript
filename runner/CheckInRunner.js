const { convertCSVToObjectSync, fixedToFloat, sleep, appendObjectToCSV, saveLog, getRandomFloat, decryptUsingAESGCM } = require('../base/utils');
const tasks = require('../tasks');
const CONFIG = require('../config/ChekInRunnerConfig.json');
const readlineSync = require('readline-sync');
const fs = require('fs');
const crypto = require('crypto');

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
    try {
        // 恢复私钥
        wt.pky = decryptUsingAESGCM(wt.a, wt.e, wt.i, wt.s, pwd)
        wt.proxy = CONFIG.proxy;
        // 执行任务
        await executeTask(wt.taskTag, wt);
        // 保存日志
        await logWithTime('../logs/Sucess', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}`);
        wt.time = new Date().toISOString();
        delete wt.wallet;
        await appendObjectToCSV(wt, '../logs/chekinSucess.csv')
        
        // 休息
        const interval = getRandomFloat(CONFIG.minInterval, CONFIG.maxInterval)
        console.log(`任务完成，线程暂停${interval}分钟`);
        await sleep(interval);
        console.log('暂停结束');

    } catch (error) {
        // 保存错误日志
        await logWithTime('../logs/Error', `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}, error:${error}`);
        wt.time = new Date().toISOString();
        wt.error = error;
        delete wt.wallet;
        await appendObjectToCSV(wt, '../logs/chekinFail.csv')
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
