/*
    woofi交互程序：
        1.查询账户ETH余额。
        2.在指定范围随机将一定数量的ETH兑换为USDC
        3.将获得的USDC兑换为ETH。
        4.存款ETH。
        5.提取ETH。
*/

const Woofi = require('../protocol/zksync/dex/woofi/woofi.js');
const { fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js');
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').zkSync
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params;
    const woofi = new Woofi();

    // 查询代币信息
    const ETHAddress = coinAddress.ETH;
    const USDCAddress =  coinAddress.USDC;
    const weWETH = '0x1d686250BBffA9Fe120B591F5992DD7fC0FD99a4'
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
 
    // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    const eeeAddr = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    // 将ETH兑换成USDC
    let tx = await woofi.swapEthToToken(wallet, eeeAddr, USDCAddress, amount);
    console.log('交易成功txHash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5) * 60 * 1000;
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 查询USDC余额
    const usdcBalance = await getBalance(wallet, USDCAddress);
    console.log('USDC余额：', fixedToFloat(usdcBalance, 6), '开始检查授权...');
    await tokenApprove(wallet, USDCAddress, woofi.routerAddr, usdcBalance);

    // 将USDC兑换成ETH
    tx = await woofi.swapTokenToEth(wallet, USDCAddress, eeeAddr, usdcBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

    // 随机暂停
    const sleepTime2 = getRandomFloat(1, 5) * 60 * 1000;
    console.log('随机暂停：', sleepTime2 / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime2)); 

    // 存款ETH
    const depositAmountEther = ethBalance * 0.5;
    console.log('存款ETH数量', depositAmountEther);

    const depositAmountWei = ethers.utils.parseEther(depositAmountEther.toString());

    let txDeposit = await woofi.deposit(wallet, depositAmountWei);
    console.log('存款成功 txHash:', txDeposit.transactionHash);
    // 随机暂停
    const sleepTime3 = getRandomFloat(1, 3) * 60 * 1000;
    console.log('随机暂停：', sleepTime3 / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime3)); 

    // 提取ETH
    const weWethBalance = await getBalance(wallet, weWETH);   
    console.log('提取ETH数量', weWethBalance);

    let txWithdraw = await woofi.withdraw(wallet);
    console.log('提取成功 txHash:', txWithdraw.transactionHash)
}

