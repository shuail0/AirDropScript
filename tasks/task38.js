/**
 * tasks : Vivaleva交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将5%-20%ETH存入;
 *  4.取出ETH
 
 */

const VivaLeva = require('../protocol/zksync/lending/vivaleva/vivaleva.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');


module.exports = async (params) => {

    const {wallet} = params;

    const vivaleva = new VivaLeva();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);

    
    // 设定随机金额
    const minAmount = ethBalance*0.05; // 最小交易数量
    const maxAmount = ethBalance*0.2; // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // // 将ETH存入
    let tx = await vivaleva.deposit(wallet, amount); 
    console.log('交易成功txHash：', tx.transactionHash);



    

};
