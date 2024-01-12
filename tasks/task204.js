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



module.exports = async (params) => {
    const { pky } = params;
    const chains = ['opBNB', 'zkSync']; // 配置链信息

    const proxy = 'http://sdpxicu7:xIN3wAWiYT9HwnKV@proxy.proxy-cheap.com:31112'


    const carv = new Carv();

    // 登陆
    const bearer = await carv.login(wallet, proxy);

    // roin签到
    await carv.fetchAmountData(bearer, 2020, proxy);

    // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        const { chainId } = await wallet.provider.getNetwork();
        // 获取签到数据
        const data = await carv.fetchAmountData(bearer, chainId, proxy)
        console.log(data);
        // 签到
        const tx = await carv.checkIn(wallet, data)
        console.log('签到成功: ', tx);
        // 休息0.1分钟
        await sleep( 0.1);
    }
};
