/*
    web3go 交互程序
        1. mintPass，只做一次，所有地址跑完之后注释掉mint程序
        2. claim，每个地址都天跑一次

*/

const Web3Go = require('../protocol/bsc/ai/web3go/web3go.js');
const ethers = require('ethers');
const {getRandomFloat, sleep } = require('../base/utils.js');
const rpc = require('../config/RpcConfig.json');
const { getContract } = require('../base/utils');
const RPC = require('../config/RpcConfig.json');

module.exports = async (params) => {

    const { pky, proxy } = params;
    const chain = 'BSC'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const web3go = new Web3Go(wallet, proxy); 

    await web3go.login();
    const sleepTime = getRandomFloat(0.1, 0.2);
    await sleep();
    
     // mintPass，只做一次，所有地址跑完之后注释掉mint程序
    // let tx = await web3go.mintPass();
    // console.log('交易成功txHash：', tx.transactionHash)

    // // 随机暂停
    // const sleepTime = getRandomFloat(1, 2) * 60 * 1000;
    // console.log('随机暂停：', sleepTime / 1000, '秒');
    // await new Promise((resolve) => setTimeout(resolve, sleepTime));



    // // 每日签到
    const claimResult = await web3go.claim();
    console.log(claimResult);
    // if (checkInResponse.status() === 200) {
    //     console.log('签到成功')
    // }else{
    //     console.log('签到失败')
    // }

    // // 查询用户信息
    // const profile = await web3go.fetchProfile();
    // console.log(profile);
    
}
