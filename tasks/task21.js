/*
    basilisk交互程序
        1. 存款ETH
        2. 提取ETH

*/

const Basilisk = require('../protocol/zksync/lending/basilisk/basilisk.js');
const { fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js');
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').zkSync
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params;
    const basilisk = new Basilisk();

    // 查询代币信息
    const ETHAddress = '0x000000000000000000000000000000000000800A';
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);

    // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.7 // 最大交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')

    // 存款ETH
    let tx = await basilisk.deposit(wallet, amount);
    console.log('交易成功txHash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 查询账户余额
    const bEthBalance = await getBalance(wallet, basilisk.BNativeAddr);
    console.log('bEth余额：', fixedToFloat(bEthBalance), '开始赎回')

    // 提取ETH
    tx = await basilisk.withdraw(wallet, bEthBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
}


