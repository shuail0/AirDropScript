/**
 *  项目名称： rhino Finance
 * 项目链接：https://app.rhino.fi/
 * 项目文档：https://docs.rhino.fi/
 * GitHub：https://github.com/orgs/rhinofi/repositories
 * 已完成功能： MintExplorer NFT.
 *
 */
const path = require("path");
const ethers = require("ethers");
const axios = require("axios");
const { getContract, floatToFixed } = require("../../../../base/utils");
const { error } = require("console");

class Rhino {
    constructor() {
        this.topTenExplorerNFTAddr = "0xdD01108F870F087B54c28aCF1a8bBAf6f6A851Ae";
        this.topThirtyExplorerNFTAddr = "0xdD01108F870F087B54c28aCF1a8bBAf6f6A851Ae";
        this.explorerNFTAbi = require("./abi/explorerNFT.json");
        this.baseurl = "https://api.rhino.fi/";
        this.headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)' }
    }

    getExplorerNFTContract(wallet, explorerNFTAddr) {
        return getContract(explorerNFTAddr, this.explorerNFTAbi, wallet);
    }

    async getSignaTure(address) {
        const url = this.baseurl + "activity-trackers/nftSignature/ZKSYNC";
        const params = { address }
        // 伪装一个headers
        let signaTure;
        try {
            // 用axio从url获取签名
            const response = await axios.get(url, { params, headers: this.headers });
            // 返回签名
            signaTure = { signa: true, data: response.data }
        } catch (error) {
            signaTure = { signa: false, data: null }

        }
        return signaTure
    }
    async getRanking(address) {
        const url = this.baseurl + "activity-trackers/trackers/ZKSYNC";
        const params = { address }
        let rankingData, ranking;
        try {
            // 用axio从url获取签名
            const response = await axios.get(url, { params, headers: this.headers });
            rankingData = response.data;
        } catch (error) {
            throw error('获取排名失败...,错误：', error)
        }

        if (rankingData.ranking.topPercentage < 0.10) {
            ranking = { signa: true, explorerNFTAddr: this.topTenExplorerNFTAddr, topPercentage: rankingData.ranking.topPercentage }
        } else if (rankingData.ranking.topPercentage < 0.3) {
            ranking = { signa: true, explorerNFTAddr: this.topThirtyExplorerNFTAddr, topPercentage: rankingData.ranking.topPercentage }
        } else {
            ranking = { signa: false, explorerNFTAddr: null, topPercentage: rankingData.ranking.topPercentage }
        }
        return ranking

    }
    async mintExplorerNFT(wallet) {
        const rankData = await this.getRanking(wallet.address);

        if (rankData.signa) {
            console.log('账户在白名单中，开始mint... ')

            const signaTure = await this.getSignaTure(wallet.address);
            const explorerNFTContract = this.getExplorerNFTContract(wallet, rankData.explorerNFTAddr);
            console.log('signaTure: ', signaTure)

            // const params = {
            //     gasPrice: await wallet.getGasPrice(),
            //     gasLimit: await explorerNFTContract.estimateGas.mint(signaTure.data)
            // };

            const response = await explorerNFTContract.mint(signaTure.data);
            return await response.wait();

        } else {
            throw error('账户不在白名单中...')
        }
    }




}

module.exports = Rhino;
