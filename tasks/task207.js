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

    const { pky, proxy } = params;
    const chain = 'Polygon'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const smartLayer = new SmartLayer(wallet);
    // 获取钱包持有的猫咪
    const getCats = await smartLayer.getCats();
    if (getCats.length > 0) {
        for (catInfo of getCats) {
            // 获取猫咪id
            const catId = catInfo.tokenId;

            // 检查是不是可以喂猫
            console.log('检查是不是可以喂猫');
            const canFeedCat = await smartLayer.canFeedCat(catId);
            console.log('检查成功，当前状态:', canFeedCat);
            if (canFeedCat) {
                // 喂猫
                console.log('开始喂猫');
                const feedCatResult = await smartLayer.feedCat(catId);
                console.log('feedCatResult:', feedCatResult);
            }

            sleep(0.1);

            // 检查是不是可以清洁
            console.log('检查是不是可以清洁');
            const canCleanCat = await smartLayer.canCleanCat(catId);
            console.log('检查成功，当前状态:', canCleanCat);
            if (canCleanCat) {
                // 清洁
                console.log('开始清洁');
                const cleanCatResult = await smartLayer.cleanCat(catId);
                console.log('cleanCatResult:', cleanCatResult);
            }

            sleep(0.1);

            // 随机邀请猫咪，如果邀请成功，就退出循环，如果邀请失败，就继续随机邀请，最多尝试5次
            for (let i = 0; i < 5; i++) {
                // 读取本地的猫咪信息
                const localCatsInfo = convertCSVToObjectSync('../data/catIds.csv');
                let localCatInfo;
                console.log('随机邀请猫咪')
                while (true) {
                    // 从catsInfo中随机取一个猫咪
                    localCatInfo = localCatsInfo[Math.floor(Math.random() * localCatsInfo.length)];
                    console.log('localCatInfo:', localCatInfo.holder);
                    // 如果猫咪不是自己的，就退出循环
                    if (localCatInfo.holder !== wallet.address) {
                        break;
                    }
                }
                // 获取猫咪id
                const localCatId = localCatInfo.tokenId;
                // 检查是不是可以玩耍
                console.log('猫咪Id', localCatId, '检查是不是可以邀请');
                const canPlayCat = await smartLayer.canPlayCat(localCatId);
                console.log('检查成功，当前状态:', canPlayCat);
                // // 如果可以，邀请猫咪
                if (canPlayCat) {
                    // 邀请猫咪
                    console.log('开始发送邀请');
                    const playCatResult = await smartLayer.inviteCatForPlaydate(catId, localCatId);
                    console.log('邀请成功，哈希:', playCatResult.transactionHash);
                    break;
                }
            }

            sleep(0.1);

            // 获取邀请列表
            console.log('检查有没有待接受的邀请');
            const inviteList = await smartLayer.getPlayInvitesList(catId);
            if (inviteList.length > 0) {
                for (invite of inviteList) {
                    console.log('invite:', invite.tokenId.toString());
                    // 接受邀请
                    const acceptResult = await smartLayer.acceptPlaydates(catId, invite.tokenId);
                    console.log('接受成功，哈希:', acceptResult.transactionHash);
                }
            }

        }
    } else {
        // 抛出异常
        throw new Error('地址: ', wallet.address, '没有猫咪');
    }



}
