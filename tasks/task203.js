/*
    web3go 交互程序
        1. mintPass，只做一次，所有地址跑完之后注释掉mint程序
        2. claim，每个地址都天跑一次

*/

const web3go = require('../protocol/bsc/ai/web3go/web3go.js');
const ethers = require('ethers');
const {getRandomFloat, sleep } = require('../base/utils.js');
const rpc = require('../config/RpcConfig.json');
const { getContract } = require('../base/utils');

module.exports = async (params) => {
    const { wallet } = params;
    const web3go = new web3go(); 

     // 获取抽奖券
    // let tx = await web3go.mintPass(wallet);
    // console.log('交易成功txHash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 2) * 60 * 1000;
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 每日签到
    const claimResult = await web3go.claim(wallet);
    if (checkInResponse.status() === 200) {
        console.log('签到成功')
    }else{
        console.log('签到失败')
    }
    
}
