/**
 * tasks200: 签到项目任务控制程序
 * 1. 遍历执行列表中的钱都任务
 * 2. 每个任务执行完毕后，随机休息0.1-0.2分钟
 * 3. 任务执行完毕后，切换账户
 * 注意： 
 *  - tasks201 首次执行只能先领取抽奖券，第二天再开始领奖励
 *  - task202 后面需要claim积分，需要时再开启，积分只能在BSC领取
 *  - task203 初次运行需要先mintPass，只做一次，所有地址跑完之后注释掉mint程序
 *  - task204 手动mintId后再开始跑程序
 * 
 * 
 */


const tasks = require('.');
const { sleep, getRandomFloat, appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance } = require('../base/coin/stkToken');

const coinAddress = require('../config/tokenAddress.json').starkNet

module.exports = async (params) => {
    const { Wallet, Address, account } = params;

    const tokens = ['ETH'];

    const BalanceInfo = { Wallet, Address }


    // 遍历tokens
    for (let j = 0; j < tokens.length; j++) {
        // 获取token
        const token = await fetchToken(coinAddress[tokens[j]], account);
        const tokenBalance = await getBalance(account, token.address);
        console.log('余额查询成功：', token['symbol'], '余额：', fixedToFloat(tokenBalance, token.decimal));
        BalanceInfo[token.symbol] = fixedToFloat(tokenBalance, token.decimal);
    }
    console.log(BalanceInfo)

    await appendObjectToCSV(BalanceInfo, '../data/stkBalances.csv')

};

