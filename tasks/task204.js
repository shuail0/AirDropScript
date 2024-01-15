/**
 * tasks104: zkBridge跨链程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链，跨链至另一条链
 * 3. 跨链金额随机（0.0001-0.0003ETH）
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { sleep } = require("../base/utils.js");
const Carv = require('../protocol/opbnb/game/carv/carv.js');
const { pro } = require("ccxt");



module.exports = async (params) => {
    const { pky, proxy } = params;
    const chains = ['opBNB', 'zkSync']; // 配置链信息

    let wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['zkSync']));


    
    // 登陆
    const carv = new Carv(wallet, proxy);


    let checkInDataInfo = {};
    const bearer = await carv.login();
    // // 遍历获取签到数据
    for (let id of [ 2020, 204, 324]) {
        try {

            console.log('开始获取签到数据，chainId: ', id);
            const data = await carv.fetchAmountData(id);
            checkInDataInfo[id] = data;
            console.log('chainId: ', id, ' data: ', data);
            
        } catch (error) {
            console.log('获取签到数据失败，chainId: ', id, ' error: ', error);
            
        }

        // 休息0.1分钟
        await sleep(0.05);
    }

    // // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        carv.wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        // 获取网络信息
        const { chainId } = await wallet.provider.getNetwork();
        // 检查checkInDataInfo中是否有该网络的签到数据
        if (!checkInDataInfo[chainId]) {
            console.log('wallet:',wallet.address, chain, '网络没有签到数据, 跳过');
            continue;
        } 
        const data = checkInDataInfo[chainId];
        // 签到
        console.log('wallet:',wallet.address, chain, '网络开始签到');
        const tx = await carv.checkIn(data)
        console.log('wallet:',wallet.address, chain, '网络签到成功,交易哈希: ', tx.transactionHash);
        // 休息0.1分钟
        await sleep(0.1);
    }
};
