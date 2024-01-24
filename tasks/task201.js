/*
    robots交互程序
        1. 领取前一天的奖励

*/

const Robots = require('../protocol/zksync/game/robot/robots.js');
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const { getRandomFloat, sleep } = require('../base/utils.js');


module.exports = async (params) => {

    const { pky, proxy } = params;
    const chain = 'zkSync'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const robots = new Robots(wallet, proxy);
    // 领取奖励
    console.log('开始领取奖励');
    try {
        const claimResult = await robots.claimRaffleRewards();
        console.log('领取结果：', claimResult);
    } catch (error) {
        console.log('领取失败：', error);

    }
    
    // 随机暂停
    const sleepTime = getRandomFloat(0.1, 0.2)
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 获取抽奖券
    console.log('开始获取抽奖券');
    let tx = await robots.getTicket();
    console.log('交易成功txHash：', tx.transactionHash)

}


