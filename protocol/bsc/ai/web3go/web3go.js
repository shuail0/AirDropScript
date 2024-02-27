const path = require('path');
const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');
const axios = require('axios');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const {sendRequest} = require('../../../../base/requestHelper');


class Web3Go {
    constructor(wallet, proxy) {
        this.contractAddr = '0xa4Aff9170C34c0e38Fed74409F5742617d9E80dc';
        this.contractAbi = require('./ABI/reiki.json');
        this.wallet = wallet;
        this.agent = new HttpsProxyAgent(proxy);
        this.baseUrl = 'https://reiki.web3go.xyz';
        this.headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,ru-RU;q=0.8,ru;q=0.7',
            'Origin': 'https://reiki.web3go.xyz',
            'referer': 'https://reiki.web3go.xyz/taskboard',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': randomUseragent.getRandom(),
        };
    }

    getWeb3goContract(contractAddr = this.contractAddr, contractAbi = this.contractAbi) {
        return getContract(contractAddr, contractAbi, this.wallet);
    }

    async mintPass() {
        const contract = this.getWeb3goContract();
        const params = {
            gasPrice: await this.wallet.getGasPrice(),
            gasLimit: await contract.estimateGas.safeMint(this.wallet.address)
        };

        const response = await contract.safeMint(
            this.wallet.address,
            params
        );
        return await response.wait();
    };

    async login() {
        let url = `${this.baseUrl}/api/account/web3/web3_nonce`
        const nonceResponse = await sendRequest(url, {
            method: 'post',
            data: { address: this.wallet.address },
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers
        });

        const nonce = nonceResponse.nonce;
        const msg = `reiki.web3go.xyz wants you to sign in with your Ethereum account:\n${this.wallet.address}\n\n${nonce}\n\nURI: https://reiki.web3go.xyz\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
        const signature = await this.wallet.signMessage(msg);

        url = `${this.baseUrl}/api/account/web3/web3_challenge`
        const jsonData = {
            address: this.wallet.address,
            nonce: nonce,
            challenge: JSON.stringify({ msg: msg }),
            signature: signature
        }

        const challengeResponse = await sendRequest(url, {
            method: 'post',
            data: jsonData,
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers
        });
        this.headers['Authorization'] = `Bearer ${challengeResponse.extra.token}`;
        return challengeResponse;
    }

    async claim() {
        const date = new Date().toISOString().split('T')[0];
        const url = `${this.baseUrl}/api/checkin?day=${date}`
        const checkInResponse = await sendRequest(url, {
            method: 'put',
            data: {},
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers
        });
        return await checkInResponse;
    }

    // 查询金叶子信息
    async fetchProfile() {
        const url = `${this.baseUrl}/api/profile`;
        const response = await axios.get(url, { httpAgent: this.agent, httpsAgent: this.agent, headers: this.headers });
        return response.data;
    }
}




module.exports = Web3Go;
