const { getContract } = require('../../../../base/utils');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const axios = require('axios');
const {sendRequest} = require('../../../../base/requestHelper');

class robots {
    constructor(wallet, proxy) {
        this.contractAddr = '0xC91AAacC5adB9763CEB57488CC9ebE52C76A2b05';
        this.contractAbi = require('./abi/ticket.json');
        this.wallet = wallet;

        this.baseUrl = 'https://robots.farm';
        this.agent = new HttpsProxyAgent(proxy);
        this.headers = {
            'authority': 'robots.farm',
            'accept-language': 'zh-CN,zh;q=0.9',
            'referer': 'https://robots.farm/airdrop/quests',
            'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': randomUseragent.getRandom(),
        };
    }

    getRobotsContract(contractAddr = this.contractAddr, contractAbi = this.contractAbi) {
        return getContract(contractAddr, contractAbi, this.wallet);
    }

    async getTicket() {
        const contract = this.getRobotsContract();
        const response = await contract.getTicket();
        return await response.wait();

    };

    async claimRaffleRewards() {
        const params = new URLSearchParams({
            'address': this.wallet.address,
        });
        const url = `${this.baseUrl}/api/raffle/v3/claim?${params}`;
        const config = { method:'get', httpAgent: this.agent, httpsAgent: this.agent, headers: this.headers };
        const response = await sendRequest(url, config);
        return response.data.message;
    }
}

module.exports = robots;
