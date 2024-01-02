/**
 * 项目名称：sleepless AI
 * 项目链接：https://www.sleeplessai.net/
 * 项目文档：
 * GitHub：
 * 已完成功能： 签到、投票
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed, multiplyBigNumberWithDecimal, fixedToFloat } = require('../../../../base/utils');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');
const contractAddress = require('./contractAddress.js')


class SlleepLessaAI {
    
    constructor() {
        this.name = 'sleeplessai';
        this.contractAddress = contractAddress;

        this.bridgeAbi = require('./abi/CoreBridge.json');

    }

    checkIn(wallet) {
        const bridge = this.getBridgeContract(wallet, contractAddress['sleeplessai'].contract);
        // const tx = await bridge.checkIn();
        // return await tx.wait()
    }

}

module.exports = SlleepLessaAI;