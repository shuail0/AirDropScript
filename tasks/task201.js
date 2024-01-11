/*
    robots交互程序
        1. 获取抽奖券

*/

const Robots = require('../protocol/zksync/game/robot/robots.js');
const ethers = require('ethers');
const {getRandomFloat, sleep } = require('../base/utils.js');


module.exports = async (params) => {
    const { wallet } = params;
    const robots = new Robots(); 

     // 领取奖励
    const claimResult = await robots.claimRaffleRewards(wallet.address);
    console.log(`领取地址: ${wallet.address}`);
    console.log(`领取结果: ${claimResult}`);

    // 随机暂停
    const sleepTime = getRandomFloat(1, 2) * 60 * 1000;
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 获取抽奖券
    let tx = await robots.getTicket(wallet);
    console.log('交易成功txHash：', tx.transactionHash)

}


