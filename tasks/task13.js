/**
 *   提币+跨链程序
 *  1. 从交易提币；
 *  2. 等待10分钟后查询钱包余额；
 *  3. 如果钱包余额 > 提币+跨链的余额 开始跨链；
 */

const tasks = require('../tasks');
const {multExchangeWithdraw} = require('../protocol/cex/multiExchangeWithdraw');
const {sleep, getRandomFloat} = require('../base/utils');

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

    // await multExchangeWithdraw(params);  // 提币
    await retry(multExchangeWithdraw, [params], 2, 5);  // 提币，最多重试1次

    const sleepTime = getRandomFloat(10, 15)
    console.log(`提币成功，等待${sleepTime}分钟后尝试跨链;`)
    await sleep(sleepTime);  // 等待10分钟
    // tasks.task11(params.wallet, params.starknetAddr);  // 跨链
    await retry(tasks.task11, [params.wallet, params.starknetAddr], 2, 5);  // 跨链，最多重试1次

 };
