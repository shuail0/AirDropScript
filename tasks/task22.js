/*
    xBank交互程序
        1. 存款ETH
        2. 取款ETH
*/


const XBank = require('../protocol/zksync/lending/xbank/xbank.js');
const { fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js');
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').zkSync
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params;
    const xBank = new XBank();

    // 查询代币信息
    const ETHAddress = '0x000000000000000000000000000000000000800A';
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);

    // 设定随机金额
    const minAmount = ethBalance * 0.3  // 最小交易数量
    const maxAmount = ethBalance * 0.5 // 最大交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // 存款ETH
    let tx = await xBank.deposit(wallet, amount);
    console.log('交易成功txHash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5) * 60 * 1000;
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 查询账户余额
    const bEthBalance = await getBalance(wallet, xBank.XBankAddr);
    console.log('xEth余额：', bEthBalance, '开始赎回')

    // 提取ETH
    tx = await xBank.withdraw(wallet, bEthBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
}
