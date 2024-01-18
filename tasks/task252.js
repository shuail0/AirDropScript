/**
 * task252： web3go mintPass 任务， 初次运行需要先mintPass，只做一次。
 * 
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
    // 登陆
    confirm.log('开始登陆');
    await web3go.login();
    const sleepTime = getRandomFloat(0.1, 0.2);
    await sleep();
    
    //  mintPass，只做一次，所有地址跑完之后注释掉mint程序
    console.log('开始mintPass');
    let tx = await web3go.mintPass();
    console.log('交易成功txHash：', tx.transactionHash)

}
