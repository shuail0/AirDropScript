/**
 * tasks3 : mavrick交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的20%-30%兑换为USDC
 *  4.查询账户USDC余额
 *  5.将USDC兑换为ETH。
 */

const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const SupSwap = require('../protocol/mode/dex/supswap/supswap.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const supSwap = new SupSwap(wallet);
    // // 查询代币信息
    const wETH = await fetchToken(coinAddress.wETH, wallet);
    const ezETH = await fetchToken(coinAddress.ezETH, wallet);
    // // // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.6 // 最大交易数量
    // // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('交易数量：', fixedToFloat(amount));
    let tx = await supSwap.swapEthToToken(wETH.address, ezETH.address, amount, 100);
    console.log('交易成功，hash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    let ezETHBalance = await getErc20Balance(wallet, ezETH.address);
    console.log('ezETH余额：', fixedToFloat(ezETHBalance), '开始授权...');

    await checkApprove(wallet, ezETH.address, supSwap.routerAddr, ezETHBalance);
    tx = await supSwap.swapTokenToToken(ezETH.address, wETH.address, ezETHBalance, 100);
    console.log('交易成功，hash：', tx.transactionHash)
};

