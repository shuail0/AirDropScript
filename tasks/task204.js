/**
 * tasks204: Carv Roin链签到任务
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const Carv = require('../protocol/opbnb/game/carv/carv.js');

module.exports = async (params) => {
    const { pky, proxy } = params;
    let wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['zkSync']));

    // 登陆
    const carv = new Carv(wallet, proxy);
    chainId = 2020;
    console.log('开始获取签到，chainId: ', chainId, '网络: Roin');
    const data = await carv.fetchAmountData(chainId);
    console.log('签到成功，chainId: ', data);

};

