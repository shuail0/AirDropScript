/*
    bear链领水程序
        1. 领测试币现在失败几率蛮高，建议多运行几次

*/

const bearToken = require('../protocol/testNet/bearChain/bearToken.js');
const { getRandomFloat, sleep } = require('../base/utils.js');
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');


module.exports = async (params) => {
    const { pky, proxy } = params;
    const chain = 'zkSync'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
    const bear = new bearToken(wallet, proxy);
    console.log('开始领取测试币');
    try {
        const dripTokenResult = await bear.dripToken();
        console.log('领取结果：', dripTokenResult);
    } catch (error) {
        console.log('领取失败：', error);
    }
    // 随机暂停
    const sleepTime = getRandomFloat(1, 2) * 60 * 1000;
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
}