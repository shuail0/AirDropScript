/**
 * tasks11 : syncswap交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.在指定范围随机将一定数量的ETH兑换为USDC
 *  4.将获得的USDC兑换为ETH。
 */

const SyncSwap = require('../protocol/zksync/dex/syncswap/SyncSwap');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove, checkUSDCApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const coinAddress = require('../config/tokenAddress.json').zkSync

module.exports = async (params) => {
    // // 设定随机的ETH数量
    const minAmount = 0.001  // 最小交易数量
    const maxAmount = 0.002 // 最大交易数量

    const {wallet} = params;
    const syncswap = new SyncSwap();
    // 查询代币信息
    const wETH = await fetchToken(coinAddress.WETH, wallet);
    const usdc = await fetchToken(coinAddress.USDC, wallet);
    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, coinAddress.ETH));
    console.log('账户ETH余额：', ethBalance);
    

    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount, wETH.decimal), ' 开始交易')

    // // 将ETH兑换成USDC
    let tx = await syncswap.swapEthToToken(wallet, wETH.address, usdc.address, amount);  
    console.log('交易成功txHash：', tx.transactionHash)
    const usdcLogs = tx.logs.filter(log => log.address.toLowerCase() === usdc.address.toLowerCase() && ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.address.toLowerCase());
    const usdcAmount = ethers.BigNumber.from(usdcLogs[0].data); // 获得的USDC数量

    // // 查询USDC余额
    console.log('获得USDC数量：', fixedToFloat(usdcAmount, usdc.decimal), '开始检查授权...');
    await checkUSDCApprove(wallet, usdc.address, syncswap.routerAddr, usdcAmount);
    tx = await syncswap.swapTokenToEth(wallet, usdc.address, wETH.address, usdcAmount);
    console.log('交易成功 txHash:', tx.transactionHash)

};

