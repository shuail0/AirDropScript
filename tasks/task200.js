/**
 * tasks104: zkBridge跨链程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链，跨链至另一条链
 * 3. 跨链金额随机（0.0001-0.0003ETH）
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");
const { getErc20Balance, fetchToken, checkApprove } = require("../base/coin/token.js");
const tokenAddresss = require('../config/tokenAddress.json');
const QnA3 = require('../protocol/bsc/ai/qna3/qna3.js');


module.exports = async (params) => {
    const { pky } = params;
    const chain = 'BSC'

    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const qna3 = new QnA3();

    // 签到
    // const tx = await qna3.checkIn(wallet, chain);
    // console.log(tx.TransactionHash);

    // 投票
    const tx = await qna3.vote(wallet, chain, 23, 1, 5);
    console.log(tx);


};