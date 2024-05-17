
/*
    Task 601
    1. taiko测试网跨链

*/

const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const TaikoBridge = require('../protocol/testNet/taiko/bridge/bridge.js');

module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Holesky));
    const taikoBridge = new TaikoBridge();
    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('交易数量：', fixedToFloat(amount));
    let tx = await taikoBridge.sendMessage(wallet, amount);
    console.log('交易成功，hash：', tx.transactionHash)
}

