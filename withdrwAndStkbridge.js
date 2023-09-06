

// stk 跨链执行程序

const { convertCSVToObjectSync, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('./base/utils');
const { BigNumber, Wallet, providers, utils } = require('ethers');
const tasks = require('./tasks');
const ethers = require('ethers');
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);


// 打开钱包地址, 这两个参数需要配置
const maxGasPrice = 20;
const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/WithdrawAndStkBridge.csv'
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
const executeTask = async (taskTag, wallet, ...args) => {
    // 转换taskTag为字符串形式
    const taskName = 'task' + taskTag;
    // 检查任务是否存在
    if (typeof tasks[taskName] === 'function') {
        console.log('地址：', wallet.Address,' 开始执行任务：', taskName)
        await tasks[taskName](wallet, ...args);
    } else {
        console.log(`Task ${taskName} not found!`);

    }
};

const walletData = convertCSVToObjectSync(walletPath);

;(
    async () => {
        console.log('开始循环...')
        for (wt of walletData) {
            const wallet = new Wallet(wt.PrivateKey, ethereumProvider);
            // 循环获取gas
            // await checkGasPrice(ethereumProvider, maxGasPrice)

            wt.wallet = wallet;


            // try {
                await executeTask(wt.taskTag, wt); // 根据taskTag执行对应的任务。
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