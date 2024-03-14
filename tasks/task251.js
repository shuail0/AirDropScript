/**
 *  任务251 -  smartlayer获取钱包持有的猫咪
 */

const SmartLayer = require('../protocol/polygon/game/smartlayer/smartlayer.js');
const ethers = require('ethers');
const { appendObjectToCSV } = require('../base/utils');
const RPC = require('../config/RpcConfig.json');

module.exports = async (params) => {

    const { pky } = params;
    const chain = 'Polygon'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
    const smartLayer = new SmartLayer(wallet);

    // 获取钱包持有的猫咪
    const getCats = await smartLayer.getCats();
    if (getCats.length > 0) {
        for (catInfo of getCats) {
            appendObjectToCSV({ holder: wallet.address, ...catInfo }, '../data/catIds.csv');
        }
    }
}
