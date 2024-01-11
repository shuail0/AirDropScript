const path = require('path');
const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');
const fakeUa = require('fake-useragent');
const { url } = require('inspector');
const axios = require('axios');


class web3go {
    constructor(){
        this.contractAddr = '0xa4Aff9170C34c0e38Fed74409F5742617d9E80dc';
        this.contractAbi = require('./ABI/reiki.json');
    }
    getWeb3goContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

    async mintPass(wallet){
        const contract = this.getWeb3goContract(wallet);
        const params = {
            gasPrice: await wallet.getGasPrice(),
            gasLimit: await contract.estimateGas.safeMint(wallet.address)
        };

        const response = await contract.safeMint(
            wallet.address,
            params
        );
        return await response.wait();
    };

    async claim(address){
        const address = wallet.address;
        const userAgent = fakeUa();
        const headers = {
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
            'user-agent': userAgent,
        };
        const axiosConfig = { headers: headers };
        const nonceResponse = await axios.post('https://reiki.web3go.xyz/api/account/web3/web3_nonce', {
        address: address
    }, axiosConfig);

        const nonce = nonceResponse.data.nonce;
        const msg = `reiki.web3go.xyz wants you to sign in with your Ethereum account:\n${address}\n\n${nonce}\n\nURI: https://reiki.web3go.xyz\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
        const signature = await wallet.signMessage(msg);

        const challengeResponse = await axios.post('https://reiki.web3go.xyz/api/account/web3/web3_challenge', {
            address: address,
            nonce: nonce,
            challenge: JSON.stringify({ msg: msg }),
            signature: signature
        }, axiosConfig);

        const token = challengeResponse.data.extra.token;

        const date = new Date().toISOString().split('T')[0];
        const checkInResponse = await axios.put(`https://reiki.web3go.xyz/api/checkin?day=${date}`, {}, {
        headers: { ...axiosConfig.headers, 'Authorization': `Bearer ${token}` }
    }); 
        return await checkInResponse.status();
    }
}



module.exports = web3go;
