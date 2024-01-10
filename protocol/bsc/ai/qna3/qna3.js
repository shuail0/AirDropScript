/**
 * 项目名称：QnA3 AI
 * 项目链接：https://qna3.ai/
 * 项目文档：
 * GitHub：
 * 已完成功能： 签到
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed, multiplyBigNumberWithDecimal, fixedToFloat } = require('../../../../base/utils');
const contractAddress = require('./contractAddress.js')


class QnA3 {
    
    constructor() {
        this.name = 'qna3';
        this.contractAddress = contractAddress;

        this.checkinContractAbi = require('./abi/qna3.json');

    }

    getCheckinContract(wallet, chain) {
        return getContract(this.contractAddress[chain], this.checkinContractAbi, wallet)
    }

    async checkIn(wallet, chain) {
        const checkinContract = this.getCheckinContract(wallet, chain);
        const tx = await checkinContract.checkIn(1);
        return await tx.wait()
    }

    async vote(wallet, chain, index, id, credit) {
        const checkinContract = this.getCheckinContract(wallet, chain);
        const tx = await checkinContract.vote(index, id, credit);
        return await tx.wait()
    }

}

module.exports = QnA3;