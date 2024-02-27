/**
 * tasks62: stk空投数量cha查询，查询完成后将结果保存在csv文件中。
 * 
 */


const tasks = require('.');
const { appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance } = require('../base/coin/stkToken');
const StarknetClaim = require('../protocol/starknet/other/starknetclaim/starknetclaim');

const coinAddress = require('../config/tokenAddress.json').starkNet

module.exports = async (params) => {
    const { account } = params;
    const starknetclaim = new StarknetClaim();
    // 查询空投
    const amount = await starknetclaim.getAirdropAmount(account);
    console.log('空投查询成功，空投数量：', amount);
    await appendObjectToCSV({...params, account:'', airdropAmount:amount}, '../data/stkAirdropInfo.csv')

};

