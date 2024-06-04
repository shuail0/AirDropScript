/**
 * tasks521 : syncswap交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的5%-20%兑换为USDC
 *  4.查询账户USDC余额
 *  5.将USDC兑换为ETH。
 */

const SyncSwap = require('../protocol/scroll/dex/syncswap/SyncSwap');
const { getSwapTokenAddress, getErc20Balance, fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Scroll

module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Scroll));
    const syncswap = new SyncSwap();
    
    // 查询代币信息
    const wETH = await fetchToken(coinAddress.WETH, wallet);
    const usdc = await fetchToken(coinAddress.USDC, wallet);

    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    
    // // 设定随机金额
    const minAmount = ethBalance * 0.05  // 最小交易数量
    const maxAmount = ethBalance * 0.2 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // 将ETH兑换成USDC
    let tx = await syncswap.swapEthToToken(wallet, wETH.address, usdc.address, amount);  
    console.log('交易成功txHash：', tx.transactionHash)

       


};

