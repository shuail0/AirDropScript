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
    const {wallet, exchangeAddr} = params;
    console.log('开始查询账户ETH余额')
    const baseETHBalance =  fixedToFloat(await getBalance(wallet));
    console.log('ETH查询成功，余额：', baseETHBalance);

    // // 提币
    console.log('开始提币')
    await multExchangeWithdraw(params);
    let sleepTime = getRandomFloat(10, 15)
    console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    await sleep(sleepTime);  // 等待10分钟

    // // 检查账户余额
    while (true) {
        try {
            const ethBalance = await getBalance(wallet);
            if (fixedToFloat(ethBalance) < 1 ){ // 如果账户余额小于1个ETH
                console.log('当前钱包余额:',fixedToFloat(ethBalance),',账户余额小于1ETH， 等待5分钟后再次查询；');
                await sleep(5);
            } else {
                console.log('当前钱包余额:',fixedToFloat(ethBalance),',账户余额大于1ETH， 程序继续运行；');
                break;
            };

        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };


    // 执行任务
    console.log('程序开始执行task31');
    await tasks.task31(params);
    console.log('task31执行完成，程序开始执行task32');
    await tasks.task32(params);
    console.log('task32执行完成，程序开始执行task33');
    await tasks.task33(params);
    console.log('task33执行完成，程序开始执行task34');
    await tasks.task34(params);
    console.log('task34执行完成，将资金充值至交易所中');

    // 将资金充值到交易所

    // 计算保留金额
    const reserveAmount = getRandomFloat(0.02, 0.022) // 预留资金0.02-0.022之间

    const ethBalance = fixedToFloat(await getBalance(wallet));

    const transferAmount = floatToFixed((ethBalance - reserveAmount));

    console.log('交互任务执行完毕，当前账户ETH余额:', ethBalance, '，预留余额：', reserveAmount, ', 转回交易所金额：', fixedToFloat(transferAmount));
    // 向交易所地址转账
    await tokenTrasfer(wallet,exchangeAddr, transferAmount);
    console.log('已将资金存入交易所，切换新账户。')
    // sleepTime = 10
    // console.log(`充值成功，等待${sleepTime}分钟后将余额归集至主账户;`)
    // await sleep(sleepTime);  // 等待10分钟

    // // 归集资金
    // assetPooling(params);

};
