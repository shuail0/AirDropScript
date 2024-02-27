/**
 * tasks205: Carv opBNB链签到任务
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { sleep } = require("../base/utils.js");
const Carv = require('../protocol/opbnb/game/carv/carv.js');



module.exports = async (params) => {
    const { pky, proxy } = params;
    const chain = 'opBNB'; // 配置链信息
    let wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
    // 获取网络信息
    const { chainId } = await wallet.provider.getNetwork();

    // 登陆
    const carv = new Carv(wallet, proxy);


    const bearer = await carv.login();
    let data;
    try {

        console.log('开始获取签到数据，chainId: ', chainId, '网络: ', chain);
        data = await carv.fetchAmountData(chainId);
        console.log('chainId: ', chainId, ' data: ', data);

    } catch (error) {
        throw new Error ('获取签到数据失败，chainId: ', chainId, ' error: ', error);

    }
    // 签到
    console.log('开始获取签到，chainId: ', chainId, '网络: ', chain);
    const tx = await carv.checkIn(data)
    console.log('wallet:', wallet.address, chain, '网络签到成功,交易哈希: ', tx.transactionHash);
    // 休息0.1分钟
    await sleep(0.1);
};

