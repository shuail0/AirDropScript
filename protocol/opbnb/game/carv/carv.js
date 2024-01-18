/**
 * 项目名称：Carv
 * 项目链接：https://carv.io/
 * 项目文档：
 * GitHub：
 * 已完成功能： 签到
 * 
 */

const { transferETHWithData } = require('../../../../base/funcs');
const axios = require('axios');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { sendRequest } = require('../../../../base/requestHelper');


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




class Carv {

    constructor(wallet, proxy) {
        this.name = 'carv';

        this.wallet = wallet;
        this.agent = new HttpsProxyAgent(proxy);

        this.baseUrl = 'https://interface.carv.io';
        this.headers = {
            'authority': 'interface.carv.io',
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'origin': 'https://protocol.carv.io',
            'referer': 'https://protocol.carv.io/',
            'user-agent': randomUseragent.getRandom(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'x-app-id': 'carv',
        }

    }

    async login() {
        const message = `Hello! Please sign this message to confirm your ownership of the address. This action will not cost any gas fee. Here is a unique text: ${Date.now()}`;
        const signature = await this.wallet.signMessage(message);
        const json_data = {
            wallet_addr: this.wallet.address,
            text: message,
            signature: signature
        };
        const url = `${this.baseUrl}/protocol/login`;

        const config = {
            httpAgent: this.agent,
            httpsAgent: this.agent,
            headers: this.headers,
            method: 'post',
            data: json_data
        };
        const response = await sendRequest(url, config);
        const token = response.data.token;
        const bearer = "bearer " + Buffer.from(`eoa:${token}`).toString('base64');
        this.headers['Authorization'] = bearer;
        this.headers['Content-Type'] = 'application/json';
        return bearer;
    }


    // 请求可以领取的数量和合约地址
    async fetchAmountData(chainId) {
        const jsonData = {
            'chain_id': chainId,
        };
        const url = `${this.baseUrl}/airdrop/mint/carv_soul`;

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


    // 签到
    async checkIn(checkInData) {
        const { permit, signature, contract } = checkInData
        const { account, amount, ymd } = permit
        // 构建交易数据
        const addressData = formHexData(account.substring(2));
        const amountData = formHexData(amount.toString(16));
        const ymdData = formHexData(ymd.toString(16));
        const transactionData = `0xa2a9539c${addressData}${amountData}${ymdData}00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000041${signature.substring(2)}00000000000000000000000000000000000000000000000000000000000000`;
        // 发送交易
        return await transferETHWithData(this.wallet, contract, transactionData);
    }

}

module.exports = Carv;
