/**
 * tasks11 : syncswapPayMast交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.在指定范围随机将一定数量的ETH兑换为USDC
 *  4.将获得的USDC兑换为ETH, 使用交易等token作为GAS支付。
 */

const SyncSwapPaymast = require('../protocol/zksync/dex/syncswapPaymast/SyncSwapPaymast.js');
const SyncSwap = require('../protocol/zksync/dex/syncswap/SyncSwap.js');

const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const coinAddress = require('../config/tokenAddress.json').zkSync

module.exports = async (params) => {

    const { wallet } = params;
    const syncswap = new SyncSwap();
    const syncswapPaymast = new SyncSwapPaymast();
    // 查询代币信息
    const wETH = await fetchToken(coinAddress.WETH, wallet);
    const USDC = await fetchToken(coinAddress.USDC, wallet);
    const DAI = await fetchToken(coinAddress.DAI, wallet);
    const USDT = await fetchToken(coinAddress.USDT, wallet);
    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, coinAddress.ETH));

    // 从USDC、DAI、USDT中随机选择一个代币
    let token = [USDC, DAI, USDT][Math.floor(Math.random() * 3)];

    // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.6 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('账户ETH余额：', ethBalance, '随机交易数量:', fixedToFloat(amount, wETH.decimal), '交易Token:', token.symbol, ' 开始交易')

    // // 将ETH兑换成USDC
    let tx = await syncswap.swapEthToToken(wallet, wETH.address, token.address, amount);
    console.log('交易成功txHash：', tx.transactionHash)
    const usdcLogs = tx.logs.filter(log => log.address.toLowerCase() === token.address.toLowerCase() && ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.address.toLowerCase());
    const outputAmount = ethers.BigNumber.from(usdcLogs[0].data); // 获得的USDC数量

    if (outputAmount.lt(floatToFixed(0.5, token.decimal))) {
        console.log('获得', token.symbol, '数量：', fixedToFloat(outputAmount, token.decimal), '数量过小，退出');
        throw new Error('获得数量过小');
    }
    const tradeAmount = outputAmount.sub(floatToFixed(0.5, token.decimal)); // 交易数量
    console.log('获得', token.symbol, '数量：', fixedToFloat(outputAmount, token.decimal), '交易数量：', fixedToFloat(tradeAmount, token.decimal), '开始检查授权...');
    
    await checkApprove(wallet, token.address, syncswapPaymast.routerAddr, tradeAmount);
    tx = await syncswapPaymast.swapTokenToEth(wallet, token, wETH, tradeAmount);
    console.log('交易成功 txHash:', tx.transactionHash);

};

