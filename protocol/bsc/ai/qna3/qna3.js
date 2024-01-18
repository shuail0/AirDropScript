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
const { toBeHex, convertCSVToObjectSync, getContract, floatToFixed, multiplyBigNumberWithDecimal, fixedToFloat, formHexData } = require('../../../../base/utils');
const { transferETHWithData } = require('../../../../base/funcs');
const contractAddress = require('./contractAddress.js');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');
const {sendRequest} = require('../../../../base/requestHelper');




class QnA3 {

    constructor(wallet, proxy) {
        this.name = 'qna3';
        this.contractAddress = contractAddress;
        this.wallet = wallet;


        this.checkinContractAbi = require('./abi/qna3.json');
        this.baseUrl = 'https://api.qna3.ai';
        this.agent = new HttpsProxyAgent(proxy);
        this.headers = {
            'authority': 'api.qna3.ai',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7',
            'content-type': 'application/json',
            'origin': 'https://qna3.ai',
            'sec-ch-ua-platform': '"Windows"',
            'user-agent': randomUseragent.getRandom(),
            'x-lang': 'english',
        }

    }

    getCheckinContract(chain) {
        return getContract(this.contractAddress[chain], this.checkinContractAbi, this.wallet)
    }

    async login() {

        const message = 'AI + DYOR = Ultimate Answer to Unlock Web3 Universe';
        this.signature = await this.wallet.signMessage(message);
        const jsonData = {
            'wallet_address': this.wallet.address,
            'signature': this.signature
        };
        const url = `${this.baseUrl}/api/v2/auth/login?via=wallet`;
        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: jsonData
        };

        const response = await sendRequest(url, config);
        this.headers['Authorization'] = `bearer ${response.data.accessToken}`;
        return response.data;

    }

    // 签到
    async checkIn(chain) {

        const checkinContract = this.getCheckinContract(chain);
        const tx = await checkinContract.checkIn(1);
        const transactionInfo = await tx.wait();

        const jsonData = {
            "hash": transactionInfo.transactionHash,
            "via": chain.toLowerCase()
        };

        if (chain === 'BSC') {
            jsonData['via'] = 'bnb';
        }
        const url = `${this.baseUrl}/api/v2/my/check-in`;

        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: jsonData
        };

        const response = await sendRequest(url, config);
        return response.data;


    }

    // 投票
    async vote(chain, index, id, credit) {
        const checkinContract = this.getCheckinContract(chain);
        const tx = await checkinContract.vote(index, id, credit);

        const transactionInfo = await tx.wait();

        const jsonData = {
            "activityId": activityIndex,
            "qsId": id,
            "txHash": transactionInfo.transactionHash
        };
        const url = `${this.baseUrl}/api/v2/activity/vote`;
        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: jsonData
        };

        const response = await sendRequest(url, config);
        return response.data.data;
    }

    async claim() {
        let url = `${this.baseUrl}/api/v2/my/claim-all`;
        let claimData
        try {
            const config = {
                httpAgent: this.agent,
                httpsAgent: this.agent,
                headers: this.headers,
                method: 'post',
                data: {}
            };

            const response = await sendRequest(url, config);
            claimData = response.data.data
        } catch (error) {
            console.log('claim-all error: ', error);
            return null;
        }

        const amountHex = formHexData(toBeHex(claimData.amount))
        const nonceHex = formHexData(toBeHex(claimData.signature.nonce))
        const signatureHex = claimData.signature.signature.slice(2)

        // // 这里发送交易
        const transactionData = `0x624f82f5${amountHex}${nonceHex}00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000041${signatureHex}00000000000000000000000000000000000000000000000000000000000000`
        const tx = await transferETHWithData(this.wallet, this.contractAddress['BSC'], transactionData)
        console.log('tx: ', tx.transactionHash);


        // // 提交claim交易信息验证
        url = `${this.baseUrl}/api/v2/my/claim/${claimData.history_id}`;
        const jsonData = {
            "hash": tx.transactionHash
        }

        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: jsonData
        };

        const response = await sendRequest(url, config);
        const responseData = response.data
        return responseData;


    }

    // 获取用户信息
    async fetchGraphqlData() {
        const jsonData = {
            'query': `query loadUserDetail($cursored: CursoredRequestInput!) {\n  userDetail {\n    checkInStatus {\n      checkInDays\n      todayCount\n    }\n    credit\n    creditHistories(cursored: $cursored) {\n      cursorInfo {\n        endCursor\n        hasNextPage\n      }\n      items {\n        claimed\n        extra\n        id\n        score\n        signDay\n        signInId\n        txHash\n        typ\n      }\n      total\n    }\n    invitation {\n      code\n      inviteeCount\n      leftCount\n    }\n    origin {\n      email\n      id\n      internalAddress\n      userWalletAddress\n    }\n    externalCredit\n    voteHistoryOfCurrentActivity {\n      created_at\n      query\n    }\n    ambassadorProgram {\n      bonus\n      claimed\n      family {\n        checkedInUsers\n        totalUsers\n      }\n    }\n  }\n}`,
            'variables': {
                "cursored": {
                    "after": "",
                    "first": 20
                }
            }
        }
        const url = `${this.baseUrl}/api/v2/graphql`;


        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: jsonData
        };

        const response = await sendRequest(url, config);
        return response.data.data;


    }

}

module.exports = QnA3;