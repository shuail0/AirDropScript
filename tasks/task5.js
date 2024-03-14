/**
 * tasks5 : ezkalibur交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的20%-30%兑换为USDC
 *  4.查询账户USDC余额
 *  5.将USDC兑换为ETH。
 */

const Ezkalibur = require('../protocol/zksync/dex/ezkalibur/ezkalibur');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params
    const ezkalibur = new Ezkalibur();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);

    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
    
    // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.6 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // // 将ETH兑换成USDC
    let tx = await ezkalibur.swapEthToToken(wallet, wETHAddress, usdc.address, amount);
    console.log('交易成功txHash：', tx.transactionHash)

    // 查询USDC余额

    usdcBalance = await getBalance(wallet, usdc.address);
    console.log('USDC余额：', fixedToFloat(usdcBalance, 6), '开始检查授权...');
    await checkApprove(wallet, usdc.address, ezkalibur.routerAddr, usdcBalance);

    tx = await ezkalibur.swapTokenToEth(wallet, usdc.address, wETH.address, usdcBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

};

