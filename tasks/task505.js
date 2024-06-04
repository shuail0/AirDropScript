/**
 * tasks505: LayerBank交互
 * 1. 查询账户余额信息
 * 2. 将30-50%余额存入
 * 3. 随机等待1-5分钟后将存入的ETH取出
 * 
 */

const ethers = require("ethers");
const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, sleep, getRandomFloat } = require("../base/utils.js");
const LayerBank = require('../protocol/mode/lending/layerbank/layerbank.js');



module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const layerbank = new LayerBank(wallet);
    const lETH = await fetchToken(layerbank.lETHAddr, wallet);

    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // 设定随机金额
    const minAmount = ethBalance * 0.3  // 最小交易数量
    const maxAmount = ethBalance * 0.5 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易金额:', amount);

    let tx = await layerbank.supply(amount);
    console.log('交易成功，hash：', tx.transactionHash);

    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // // 查询lETH余额
    const lETHBalance = await getErc20Balance(wallet, lETH.address);
    console.log('lETH余额：', fixedToFloat(lETHBalance, lETH.decimal), '开始授权...');

    await checkApprove(wallet, lETH.address, layerbank.core, lETHBalance);
    console.log('开始取出ETH');
    tx = await layerbank.redeemToken(lETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

    
};