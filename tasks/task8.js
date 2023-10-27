/**
 * tasks8: reactorfusion借贷项目交互程序
 * 1. 存入ETH 20%-30% 的ETH
 * 2. 查询rf ETH数量
 * 3. 取出ETH
 */

const Reactorfusion = require('../protocol/zksync/lending/reactorfusion/rectorfusion');
const { fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js')
const ethers = require('ethers');


module.exports = async (params) => {
    const { wallet } = params
    const ETHAddress = '0x0000000000000000000000000000000000000000';

    const reactorfusion = new Reactorfusion();
    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
    // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始存入ETH');

    let tx = await reactorfusion.supplyEth(wallet, amount);
    console.log('交易成功 txHash:', tx.transactionHash)

    await sleep(2);
    const frEthBalance = await getBalance(wallet, reactorfusion.rfETHAddr);
    console.log('rfEth余额：', frEthBalance, '开始取出ETH')

    tx = await reactorfusion.withdrawEth(wallet, frEthBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
};