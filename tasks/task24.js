/**
 * tasks : DraculaFi交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的20%-30%兑换为USDC
 *  4.查询账户USDC余额
 *  5.将USDC兑换为ETH。
 */

const DraculaFi = require('../protocol/zksync/dex/draculaFi/DraculaFi.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {

    const {wallet} = params;

    const draculafi = new DraculaFi();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
    
    // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.7 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')

    // 将ETH兑换成USDC
    let tx = await draculafi.swapEthToToken(wallet, wETH.address, usdc.address, amount, min=ethers.BigNumber.from(0));    
    console.log('交易成功txHash：', tx.transactionHash)

    const usdcLogs = tx.logs.filter(log => log.address.toLowerCase() === usdc.address.toLowerCase() && ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.address.toLowerCase());
    const usdcAmount = ethers.BigNumber.from(usdcLogs[0].data); // 获得的USDC数量
    // // 查询USDC余额
    console.log('获得USDC数量：', fixedToFloat(usdcAmount, usdc.decimal), '开始检查授权...');
    await checkApprove(wallet, usdc.address, draculafi.routerAddr, usdcAmount);
    

    tx = await draculafi.swapTokenToEth(wallet, usdc.address, wETH.address, usdcAmount, min=ethers.BigNumber.from(0));
    console.log('交易成功 txHash:', tx.transactionHash)

};
