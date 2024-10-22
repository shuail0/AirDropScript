/**
 * tasks : OnsenSwap交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将0.0003-0.0007ETH兑换为USDC
 *  4. 只兑换成USDC，不换回ETH
 
 */

const OnsenSwap = require('../protocol/zksync/dex/onsen/onsen.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');


module.exports = async (params) => {

    const {wallet} = params;

    const onsenswap = new OnsenSwap();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
    
    // 设定随机金额
    const minAmount = 0.0003  // 最小交易数量
    const maxAmount = 0.0007 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // 将ETH兑换成USDC
    let tx = await onsenswap.swapExactETHForTokens(wallet, wETH.address, usdc.address, amount, min=ethers.BigNumber.from(0)); 
    console.log('交易成功txHash：', tx.transactionHash);



    

};
