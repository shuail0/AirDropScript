/**
 * task253: robot获取抽奖券任务，初次执行需要执行一次，后续无需执行。
 */

const Robots = require('../protocol/zksync/game/robot/robots.js');
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');

module.exports = async (params) => {

    const { pky, proxy } = params;
    const chain = 'zkSync'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const robots = new Robots(wallet, proxy);

    // 获取抽奖券
    console.log('开始获取抽奖券');
    let tx = await robots.getTicket();
    console.log('交易成功txHash：', tx.transactionHash)

}


