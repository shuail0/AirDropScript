/*
    robots交互程序
        1. 获取抽奖券

*/

const Robots = require('../protocol/zksync/game/robot/robots.js');
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params;
    const robots = new Robots(); 

    // 获取抽奖券
    let tx = await robots.getTicket(wallet);
    console.log('交易成功txHash：', tx.transactionHash)
}


