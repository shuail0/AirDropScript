const { getContract } = require('../../../../base/utils');

class robots {
    constructor(){
        this.contractAddr = '0xC91AAacC5adB9763CEB57488CC9ebE52C76A2b05';
        this.contractAbi = require('./abi/ticket.json');
    }
    getRobotsContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     async getTicket(wallet){
        const contract = this.getRobotsContract(wallet);
        const response = await contract.getTicket();
        return await response.wait();

    };

    async claimRaffleRewards(wallet) {
        const headers = {
          'authority': 'robots.farm',
          'accept-language': 'zh-CN,zh;q=0.9',
          'referer': 'https://robots.farm/airdrop/quests',
          'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        };
        const params = new URLSearchParams({
            'address': wallet,
        });

        const url = `https://robots.farm/api/raffle/v3/claim?${params}`;
        console.log(url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching claim rewards:', error);
            throw error;
    }
    }
}

module.exports = robots;
