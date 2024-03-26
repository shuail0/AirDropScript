/**
 * tasks103: Renzo Mint程序  
 * 1. 查询账户余额信息
 * 2. 除去预留的金额外，将余额转入Mode网络
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");
const Renzo = require('../protocol/mode/reStake/renzo/renzo.js');



module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const renzo = new Renzo(wallet);
    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // 设定随机金额
    const minAmount = ethBalance * 0.3  // 最小交易数量
    const maxAmount = ethBalance * 0.5 // 最大交易数量
    // 随机交易数量
    let depositAmount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    const tx = await renzo.depositETH(depositAmount)
    console.log('交易成功，hash：', tx.transactionHash)
};