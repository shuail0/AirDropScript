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
const Kim = require('../protocol/mode/dex/kim/kim.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const kim = new Kim(wallet);
    // // 查询代币信息
    const wETH = await fetchToken(coinAddress.wETH, wallet);
    const USDC = await fetchToken(coinAddress.USDC, wallet);
    const ezETH = await fetchToken(coinAddress.ezETH, wallet);

    // // // 查询账户余额
    const ezETHBalance = fixedToFloat(await getErc20Balance(wallet, ezETH.address));
    console.log('账户ezETH余额：', ezETHBalance);

    // 把ezETH兑换成USDC

    // // // 设定随机金额
    // const minAmount = ethBalance * 0.2  // 最小交易数量
    // const maxAmount = ethBalance * 0.6 // 最大交易数量
    // // 随机交易数量
    // let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    let amount = floatToFixed(0.0001);
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')
    await checkApprove(wallet, ezETH.address, kim.swapRouterAddr, amount);

    let tx = await kim.swapTokenToToken(ezETH.address, wETH.address, amount);
    console.log('交易成功，hash：', tx)

    // 查询USDC余额

    // usdcBalance = await getErc20Balance(wallet, USDC.address);
    // console.log('USDC余额：', fixedToFloat(usdcBalance, 6), '开始授权...');
    
    // await checkApprove(wallet, USDC.address, kim.swapRouterAddr, usdcBalance);

    // let tx = await kim.swapTokenToEth(USDC.address, wETH.address, usdcBalance);
    // console.log('交易成功 txHash:', tx.transactionHash)

};

