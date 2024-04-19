/**
 *   Starknet提币+跨链程序
 *  1. 从交易提币至Starknet网络；
 *  2. 等待10分钟后查询钱包余额；
 *  3. 如果钱包余额 > 提币+跨链的余额 将ETH跨链至主网；
 */

const tasks = require('.');
const { multExchangeWithdraw } = require('../protocol/cex/multiExchangeWithdraw');
const { sleep, getRandomFloat, floatToFixed, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance } = require('../base/coin/stkToken');
const StkBridges = require('../protocol/starknet/crosschain/stkbridges/stkbridges');
const coinAddress = require('../config/tokenAddress.json').starkNet

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
    const { account, exchangeAddr } = params;
    const tokenSymbol = 'ETH'
    const token = await fetchToken(coinAddress[tokenSymbol], account);
    // 查询余额
    let tokenBalance = await getBalance(account, token.address);
    if (tokenBalance.lt(floatToFixed(0.01))) {
        await retry(multExchangeWithdraw, [params], 2, 5);  // 提币，最多重试1次
        const sleepTime = getRandomFloat(10, 15)
        console.log(`提币成功，等待${sleepTime}分钟后尝试跨链;`)
        await sleep(sleepTime);  // 等待10分钟
    }
    // // 再次查询余额
    while (true) {
        tokenBalance = await getBalance(account, token.address);
        if (tokenBalance.lt(floatToFixed(0.01))) { // 如果账户余额小于1个ETH
            console.log('当前钱包余额:', fixedToFloat(tokenBalance), ',账户余额小于', 0.001, 'ETH, 等待5分钟后再次查询;');
            await sleep(5);
        } else {
            console.log('当前钱包余额:', fixedToFloat(tokenBalance), ',账户余额大于', 0.001, 'ETH, 程序继续运行；');
            break;
        };
    };
    const amount = BigInt(tokenBalance.sub(floatToFixed(0.0007))); // 预留0.0007的GAS
    console.log('账户ETH余额：', fixedToFloat(tokenBalance), '跨链数量：', fixedToFloat(amount));

    // 跨链
    const stkBridges = new StkBridges();
    const tx = await stkBridges.withdrawETH(account, token, amount, exchangeAddr);
    console.log('跨链成功,hash:', tx);

};
