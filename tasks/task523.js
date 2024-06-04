/**
 * tasks : Tokan Exchange交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的5%-20%兑换为USDC
 *  4.查询账户USDC余额
 *  5.将USDC兑换为ETH。
 */

const Tokan = require('../protocol/scroll/dex/tokan/tokan.js');
const ethers = require('ethers');
const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Scroll
const { floatToFixed, fixedToFloat, sleep, getRandomFloat } = require("../base/utils.js");


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Scroll));
    const tokan = new Tokan();
   

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
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')

    // 将ETH兑换成USDC
    let tx = await tokan.swapEthToToken(wallet, min=ethers.BigNumber.from(0), wETH.address, usdc.address, amount);    
    console.log('交易成功txHash：', tx.transactionHash)

    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 查询USDC余额
    const usdcBalance = await getErc20Balance(wallet, usdc.address);
    console.log('USDC数量：', fixedToFloat(usdcBalance, usdc.decimal), '开始检查授权...');
    await checkApprove(wallet, usdc.address, tokan.routerAddr, usdcBalance);
    

    tx = await tokan.swapTokenToEth(wallet, usdcBalance, min=ethers.BigNumber.from(0), usdc.address, wETH.address);
    console.log('交易成功 txHash:', tx.transactionHash)

};
