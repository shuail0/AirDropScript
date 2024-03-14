/**
 * 大额交互程序
 * 1. 从OK提币
 * 2. 检查账户余额
 * 3. 随机执行任务列表中的一个任务
 * 4. 充值到交易所
 * 5. 将所有的资金归集到主账户中
 */

const tasks = require('./index.js');
const { multExchangeWithdraw, assetPooling } = require('../protocol/cex/multiExchangeWithdraw.js');
const { fetchToken, getBalance, tokenTransfer } = require('../base/coin/stkToken.js');
const { multiplyBigNumberWithDecimal, fixedToFloat, sleep, getRandomFloat, floatToFixed } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').starkNet


module.exports = async (params) => {
    const { account, exchangeAddr } = params;
    console.log('开始查询账户ETH余额')
    const baseETHBalance = fixedToFloat(await getBalance(account, coinAddress.ETH));
    console.log('ETH查询成功，余额：', baseETHBalance);

    // 提币
    console.log('开始提币')
    await multExchangeWithdraw(params);
    let sleepTime = getRandomFloat(10, 15)
    console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    await sleep(sleepTime);  // 等待10分钟

    // 检查账户余额
    while (true) {
        try {
            const ethBalance = await getBalance(account, coinAddress.ETH);
            if (fixedToFloat(ethBalance) < 1) { // 如果账户余额小于1个ETH
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额小于1ETH， 等待5分钟后再次查询；');
                await sleep(5);
            } else {
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额大于1ETH， 程序继续运行；');
                break;
            };

        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };


    // // 执行任务
    console.log('程序开始执行task71');
    await tasks.task471(params);
    console.log('task71执行完成，程序开始执行task72');
    await tasks.task472(params);
    console.log('task72执行完成，程序开始执行task73');
    await tasks.task473(params);
    console.log('task73执行完成，程序开始执行task74');
    await tasks.task744(params);
    console.log('task74执行完成，将资金充值至交易所中');

    // 将资金充值到交易所

    // // // 计算保留金额
    const reserveAmount = getRandomFloat(0.02, 0.023) // 预留资金0.02-0.022之间
    const ethBalance = await getBalance(account, coinAddress.ETH);
    const transferAmount = ethBalance.sub(floatToFixed(reserveAmount)) // 预留0.02ETH作为gas费
    console.log('交互任务执行完毕，当前账户ETH余额:', fixedToFloat(ethBalance), '，预留余额：', reserveAmount, ', 转回交易所金额：', fixedToFloat(transferAmount));
    // // // 向交易所地址转账
    await tokenTransfer(account, coinAddress.ETH, exchangeAddr, transferAmount);
    console.log('已将资金存入交易所，切换新账户。')

};
