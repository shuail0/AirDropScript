/**
 * tasks103: Renzo Mint程序  
 * 1. 查询账户余额信息
 * 2. 除去预留的金额外，将余额转入Mode网络
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat } = require("../base/utils.js");
const Renzo = require('../protocol/mode/reStake/renzo/renzo.js');



module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const renzo = new Renzo(wallet);
    const depositAmount = floatToFixed(0.0001);
    const tx = await renzo.depositETH(depositAmount)
    console.log('交易成功，hash：', tx.transactionHash)
};