/**
 * task207 smartlayer 查空投数量
 *  1. 喂猫
 *  2. 清洁
 *  3. 随机邀请
 *  4. 接受邀请
 */

const SmartLayer = require('../protocol/polygon/game/smartlayer/smartlayer.js');
const ethers = require('ethers');
const { appendObjectToCSV, sleep } = require('../base/utils.js');
const rpc = require('../config/RpcConfig.json');
const { getContract } = require('../base/utils');
const RPC = require('../config/RpcConfig.json');

module.exports = async (params) => {

    const { Wallet, pky, proxy } = params;
    const chain = 'Polygon'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const smartLayer = new SmartLayer(wallet);
    let retryCount = 0;

    while (retryCount < 5) {
        try {
            const airdropAmount = await smartLayer.qureyAirdrop();
            const airdropInfo = {Wallet, Address: wallet.address, Amount: airdropAmount};
            console.log(airdropInfo);
            await appendObjectToCSV(airdropInfo, `../data/SmartLayerAirdropInfo.csv`);
            break; // Exit the loop if successful
        } catch (error) {
            retryCount++;
            console.log(`Retry ${retryCount} failed: ${error}`);
            await sleep(0.5)
            if (retryCount === 5) {
                const airdropError = {Wallet, Address: wallet.address, Error: error};
                console.log(airdropError);
                await appendObjectToCSV(airdropError, `../data/SmartLayerAirdropError.csv`);
            }
        }
    }
}
