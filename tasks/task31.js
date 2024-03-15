/*

    gambit交互程序
        1. 检测钱包是否有足够的usdc
        2. 如果有足够的usdc，那么就直接调用depositUsdc
        3. 如果没有足够的usdc，那么就前往mute进行兑换
        4. 调用depositUsdc
        5. 调用withdrawUsdc
*/

const Gambit = require('../protocol/zksync/dex/gambit/gambit.js');
const Mute = require('../protocol/zksync/dex/mute/mute.js');
const { getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat } = require('../base/utils.js')
const coinAddress = require('../config/tokenAddress.json').zkSync
const ethers = require('ethers');


module.exports = async (params) => {
    const { wallet } = params;
    const gambit = new Gambit();
    const mute = new Mute();
    const usdcAddress = coinAddress.USDC;
    const ethAddress = coinAddress.ETH;
    const gUSDCAddress = "0x0729e806f57CE71dA4464c6B2d313E517f41560b";
    const wETHAddress = coinAddress.WETH;

    // 设定随机金额
    const minAmount = 0.1  // 最小交易数量
    const maxAmount = 0.3 // 最大交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount, 6), 6);
    console.log('随机交易数量', fixedToFloat(amount),)

    // 查询usdc授权
    let usdcBalance = await getBalance(wallet, usdcAddress);
    console.log('USDC余额：', fixedToFloat(usdcBalance, 6),);

    if (usdcBalance <= 1) {
        console.log('USDC余额小于1，开始兑换Usdc');
        // 查询eth余额
        const ethBalance = await getBalance(wallet, ethAddress);
        console.log('账户ETH余额：', fixedToFloat(ethBalance, 6));
        // 随机交易数量
        const minAmount = ethBalance * 0.2  // 最小交易数量
        const maxAmount = ethBalance * 0.3 // 最大交易数量
        amount = floatToFixed(getRandomFloat(minAmount, maxAmount, 6), 6);
        console.log('随机交易数量', fixedToFloat(amount),)
        // eth兑换usdc
        console.log('开始兑换Usdc');
        let tx = await mute.swapEthToToken(wallet, ethAddress, usdcAddress, amount);
        console.log('交易成功 txHash:', tx.transactionHash)
        // 开始存款Usdc
        console.log('开始存款Usdc, 金额：', amount);
        tx = await gambit.depositUsdc(wallet, amount);
        console.log('交易成功 txHash:', tx.transactionHash)
    }
    console.log('开始授权Usdc')
    await checkApprove(wallet, usdcAddress, gambit.contractAddr, usdcBalance);
    //     // 存款Usdc
    console.log('开始存款Usdc, 金额：', amount);
    let tx = await gambit.depositUsdc(wallet, amount);
    console.log('交易成功 txHash:', tx.transactionHash)
    // 剩余usdc兑换回eth
    usdcBalance = await getBalance(wallet, usdcAddress);
    console.log('USDC余额：', fixedToFloat(usdcBalance, 6),'开始检查授权...');
    await checkApprove(wallet, usdcAddress, mute.routerAddr, usdcBalance);
    tx = await mute.swapTokenToEth(wallet, usdcAddress, wETHAddress, usdcBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

}