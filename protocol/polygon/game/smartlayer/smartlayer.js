/**
 * 项目名称：Smart Layer
 * 项目链接：https://www.smartlayer.network/smartcatplay
 * 项目文档：
 * GitHub：
 * 已完成功能： 签到
 * 
 */

const { transferETHWithData } = require('../../../../base/funcs');
const axios = require('axios');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const qs = require('qs');

const { getContract, add10PercentGasPrice } = require('../../../../base/funcs');


function formHexData(string) {
    // 确保数据是一个字符串
    if (typeof string !== 'string') {
        throw new Error('Input must be a string.');
    }

    // 如果字符串长度超过 64 个字符，则抛出错误
    if (string.length > 64) {
        throw new Error('String length exceeds 64 characters.');
    }

    // 在字符串前面添加零以达到 64 个字符的长度
    return '0'.repeat(64 - string.length) + string;
}




class SmartLayer {

    constructor(wallet) {
        this.wallet = wallet;
        this.smartCatContractAddress = '0x7573933eB12Fa15D5557b74fDafF845B3BaF0ba2';
        this.smartCatAbi = require('./abi/smartCat.json');
    }

    getSmartCatContract() {
        return getContract(this.smartCatContractAddress, this.smartCatAbi, this.wallet);
    }

    // 获取钱包持有猫咪
    async getCats() {
        const params = {
            smartContract: '0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe',
            chain: 'polygon',
            owner: this.wallet.address,
            blockchain: 'evm',
        }
        const url = `https://api.token-discovery.tokenscript.org/get-owner-tokens?${qs.stringify(params)}`;
        const response = await axios.get(url);
        return response.data;
    }

    // 检查是否可以喂食
    async canFeedCat(catId) {
        const contract = this.getSmartCatContract();
        return await contract.canFeed(catId);
    }

    // 喂猫
    async feedCat(catId) {
        const contract = this.getSmartCatContract();
        const gasPriceWith10Percent = await add10PercentGasPrice(this.wallet);
        const response = await contract.feedCat(catId, { gasPrice: gasPriceWith10Percent });
        return await response.wait()
    };

    // 检查是否可以清洁
    async canCleanCat(catId) {
        const contract = this.getSmartCatContract();
        return await contract.canClean(catId);
    };

    // 清洁
    async cleanCat(catId) {
        const contract = this.getSmartCatContract();
        // 增加10%的gasPrice
        const gasPriceWith10Percent = await add10PercentGasPrice(this.wallet);
        const response = await contract.cleanCat(catId, { gasPrice: gasPriceWith10Percent });
        return await response.wait()
    };

    // 检查是否可以玩
    async canPlayCat(catId) {
        const contract = this.getSmartCatContract();
        return await contract.canPlay(catId);
    };

    // 邀请猫咪
    async inviteCatForPlaydate(catId, invitedCatId) {
        const contract = this.getSmartCatContract();
        // 增加10%的gasPrice
        const gasPriceWith10Percent = await add10PercentGasPrice(this.wallet);
        const response = await contract.inviteCatForPlaying(catId, invitedCatId,  { gasPrice: gasPriceWith10Percent });
        return await response.wait()
    }


    // 接受邀请
    async acceptPlaydates(catId, inviterCatId) {
        const contract = this.getSmartCatContract();
        // 增加10%的gasPrice
        const gasPriceWith10Percent = await add10PercentGasPrice(this.wallet);
        const response = await contract.acceptPlayDate(catId, inviterCatId,  { gasPrice: gasPriceWith10Percent });
        return await response.wait()
    }


    // 检查是否可以升级
    async canLevelUp(catId) {
        const contract = this.getSmartCatContract();
        return await contract.canLevelUp(catId);
    }
    // 升级猫咪
    async leverlUp(catId) {
        const contract = this.getSmartCatContract();
        // 增加10%的gasPrice
        const gasPriceWith10Percent = await add10PercentGasPrice(this.wallet);
        const response = await contract.levelUp(catId,  { gasPrice: gasPriceWith10Percent });
        return await response.wait()
    }

    // getLevel
    async getLevel(catId) {
        const contract = this.getSmartCatContract();
        return await contract.getLevel(catId);
    }

    // 获取邀请他人的列表
    async getPendingInvitesList(catId) {
        const contract = this.getSmartCatContract();
        return await contract.getPendingInvitesList(catId);
    }

    // 获取被邀请的列表
    async getPlayInvitesList(catId) {
        const contract = this.getSmartCatContract();
        return await contract.getPlayInvitesList(catId);
    }

    async qureyAirdrop(){
        const url = `https://backend.smartlayer.network/airdrop/homebrew-eligibility?address=${this.wallet.address}&withProof=true`;
        const headers = {
            'User-Agent': randomUseragent.getRandom()
        };
        const response = await axios.get(url, { headers: headers });
        if (response.data.eligible) {
            const amount = response.data.details.amount;
            return amount / 10 ** 18;
        } else {
            return 0;
        }
        
    }


}
module.exports = SmartLayer;
