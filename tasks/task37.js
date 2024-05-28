/**
 * tasks : Veno交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将0.00001-0.0001ETH存入
 *  4.只存入，不取
 
 */

const Veno = require('../protocol/zksync/lending/veno/veno.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');


module.exports = async (params) => {

    const {wallet} = params;

    const veno = new Veno();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
   
    
    // 设定随机金额
    const minAmount = 0.00001 // 最小交易数量
    const maxAmount = 0.0001 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount,maxAmount, 6));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // // 将ETH存入
    let tx = await veno.stake(wallet, amount); 
    console.log('交易成功txHash：', tx.transactionHash);



    

};
