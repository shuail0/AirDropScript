/**
 * 大额交互程序
 * 1. 从OK提币
 * 2. 检查账户余额
 * 3. 随机执行任务列表中的一个任务
 * 4. 充值到交易所
 * 5. 将所有的资金归集到主账户中
 */

const tasks = require('.');
const { multExchangeWithdraw, assetPooling } = require('../protocol/cex/multiExchangeWithdraw');
const { sleep, getRandomFloat, floatToFixed, fixedToFloat } = require('../base/utils');
const { getBalance, tokenTrasfer } = require('../base/coin/token');
const coinAddress = require('../config/tokenAddress.json').zkSync

// 执行函数
const executeTask = async (taskTag, params) => {
    // 转换taskTag为字符串形式
    const taskName = "task" + taskTag;
    // 检查任务是否存在
    if (typeof tasks[taskName] === "function") {
        await tasks[taskName](params);
    } else {
        console.log(`Task ${taskName} not found!`);
    }
};

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

module.exports = async (params) => {
    const { wallet, amount } = params;
    // 提币
    console.log('开始提币')
    await multExchangeWithdraw(params);
    let sleepTime = getRandomFloat(5, 10)
    console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    await sleep(sleepTime);  // 等待10分钟

    // 检查账户余额
    while (true) {
        try {
            const ethBalance = await getBalance(wallet);
            if (fixedToFloat(ethBalance) < amount) { // 如果账户余额小于1个ETH
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额小于', amount, 'ETH， 等待1分钟后再次查询；');
                await sleep(1);
            } else {
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额大于', amount, 'ETH， 程序继续运行；');
                break;
            };
        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };

    // 跨链至主网

    const bridgeAmount = floatToFixed(amount, 18);    

    console.log('开始跨链至主网, 转入数量：', fixedToFloat(bridgeAmount, 18));
    // 提款（L2跨链回主网）
    // 1. 在L2提款
    const response = await wallet.withdraw({
        token: coinAddress.ETH,
        amount: bridgeAmount
    });

    // 2. 等待在L1完成提款
    const tx = await response.wait();
    console.log('跨链成功 tx: ', tx.transactionHash);


};
