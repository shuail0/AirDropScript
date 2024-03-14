/*
    openOcean交互程序
        1. ETH swap USDC
        2. USDC swap ETH
*/

const OpenOcean= require('../protocol/zksync/dex/openOcean/openOcean.js');
const ethers = require('ethers');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick,fixedToFloat} = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const coinAddress = require('../config/tokenAddress.json').zkSync

module.exports = async (params) => {
    const {wallet} = params;

    const openOcean = new OpenOcean();

    const ETHAddress = coinAddress.ETH;
    const USDCAddress = coinAddress.USDC;
    const wETHAddress = coinAddress.wETH;

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);

    //设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量

    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')

    // swap ETH to USDC
    let tx = await openOcean.swap(wallet,wETHAddress, USDCAddress, amount);
    console.log('交易成功 txHash:', tx.transactionHash)

    await sleep(2);

    // 查询USDC余额
    const USDC = await fetchToken(USDCAddress, wallet);
    const USDCBalance = await getBalance(wallet, USDC.address);
    console.log('USDC余额：', fixedToFloat(USDCBalance));

    // swap USDC to ETH
    tx = await openOcean.swap(wallet, USDCAddress, wETHAddress, USDCBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
}




