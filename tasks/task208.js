/**
 * task207 smartlayer 交互任务
 *  1. 喂猫
 *  2. 清洁
 *  3. 随机邀请
 *  4. 接受邀请
 */

const SmartLayer = require('../protocol/polygon/game/smartlayer/smartlayer.js');
const ethers = require('ethers');
const { getRandomFloat, sleep, convertCSVToObjectSync } = require('../base/utils.js');
const rpc = require('../config/RpcConfig.json');
const { getContract } = require('../base/utils');
const RPC = require('../config/RpcConfig.json');
const { pro } = require('ccxt');

module.exports = async (params) => {

    const { Wallet, pky, proxy } = params;
    const chain = 'Polygon'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const smartLayer = new SmartLayer(wallet);
    const airdropAmount = await smartLayer.qureyAirdrop();
    const airdropInfo = {Wallet, Address: wallet.address, Amount: airdropAmount};
    console.log(airdropInfo);
    await appendObjectToCSV(airdropInfo, `../data/SmartLayerAirdropInfo.csv`)
}
