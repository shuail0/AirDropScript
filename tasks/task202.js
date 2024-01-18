/**
 * tasks202: Qna3 签到程序  
 * 1. qna3.ai 签到
 * 2. 投票和领取积分(vote/claim)功能已经实现，需要时开启
 * 
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const QnA3 = require('../protocol/bsc/ai/qna3/qna3.js');


module.exports = async (params) => {

    const { pky, proxy } = params;
    const chain = 'opBNB'

    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const qna3 = new QnA3(wallet, proxy);
    // 登陆
    await qna3.login();
    // 获取用户信息
    const graphlData = await qna3.fetchGraphqlData();
    if (graphlData.userDetail.checkInStatus.todayCount === 0) {
        // 签到
        console.log(' Qna3 地址今日未签到，开始签到');
        const repsponse = await qna3.checkIn(chain);
        console.log('签到成功: ', repsponse);
        // 跳出循环

    } else {
        console.log(' Qna3 今日已签到');
    }



    // // 投票， 投票需要投票在设定
    // await qna3.vote(wallet, chain, 23, 1, 5);
    // console.log(tx);

    // 领取积分 只能在BSC领取,需要领取的时候再开启
    // await qna3.claim();

};