/**
 * tasks63: stk空投claime程序,需要用tasks62的查询结果执行
 * 
 */


const tasks = require('.');
const { appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance } = require('../base/coin/stkToken');
const StarknetClaim = require('../protocol/starknet/other/starknetclaim/starknetclaim');

const coinAddress = require('../config/tokenAddress.json').starkNet

module.exports = async (params) => {
    const { account, airdropAmount } = params;
    const starknetclaim = new StarknetClaim();

    // // 开始空投claime
    let tx = await starknetclaim.claim(account, airdropAmount);
    console.log('空投claime成功，交易哈希：', tx);


};

