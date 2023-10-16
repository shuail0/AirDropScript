/**
 * 
 * 1. 从bitget提币
 * 2. 检查账户余额
 * 3. 随机执行任务列表中的一个任务
 * 4. 充值到交易所
 * 5. 将所有的资金归集到主账户中
 */

const tasks = require('.');
const { multExchangeWithdraw } = require('../protocol/cex/multiExchangeWithdraw');
const { sleep, getRandomFloat, floatToFixed } = require('../base/utils');
const { getBalance, tokenTrasfer } = require('../base/coin/token');

const retry = async (fn, args = [], retries = 3, interval = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error on attempt ${i + 1}:`, error.message);
            if (i < retries - 1) {
                console.log(`Waiting for ${interval} seconds before retrying...`);
                await sleep(interval);
            } else {
                console.error('No more retries left.');
                throw error;
            }
        }
    }
}


module.exports = async (params) => {
    const {wallet, exchangeAddr} = params
    // console.log('wallet', wallet)
    // 提币
    // await retry(multExchangeWithdraw, [params], 2, 5);  // 提币，最多重试1次
    // const sleepTime = getRandomFloat(10, 15)
    // console.log(`提币成功，等待${sleepTime}分钟后查询账户余额;`)
    // await sleep(sleepTime);  // 等待10分钟

    // 检查账户余额
    // const ethBalance = await getBalance(wallet);
    // console.log(ethBalance)

    // 执行任务
    // tasks.tasks8(wallet);

    // 将资金充值到交易所
    // const amount = floatToFixed(0.001)
    // tokenTrasfer(wallet,exchangeAddr, amount).then(console.log)
    // const sleepTime = getRandomFloat(10, 15)
    // console.log(`提币成功，等待${sleepTime}分钟后查询账户余额;`)
    // await sleep(sleepTime);  // 等待10分钟

    // 归集资金
    // assetPooling(params);


};
