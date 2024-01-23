
const axios = require('axios');
const randomUseragent = require('random-useragent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { sendRequest } = require('../../../base/requestHelper.js');
const { createTask, getTaskResult } = require('../../../base/yesCaptCha/yescaptcha.js');
const { Wallet } = require('ethers');
const { getRandomFloat, sleep } = require('../../../base/utils.js');

class bearToken {
            constructor(wallet, proxy) {
            this.name = 'bearToken';
            this.address = wallet.address;
            this.agent = new HttpsProxyAgent(proxy);
            this.websiteKey = '6LfOA04pAAAAAL9ttkwIz40hC63_7IsaU2MgcwVH';
            this.websiteUrl = 'https://artio.faucet.berachain.com';
            this.headers = {
                'authority': 'artio-80085-faucet-api-recaptcha.berachain.com', 
                'accept': '*/*',
                'accept-language': 'zh-CN,zh;q=0.9', 
                'cache-control': 'no-cache', 
                'content-type': 'text/plain;charset=UTF-8',
                'origin': 'https://artio.faucet.berachain.com', 
                'pragma': 'no-cache',
                'referer': 'https://artio.faucet.berachain.com/',
                'user-agent': randomUseragent.getRandom(),
            }
        }

        async recaptcha(pageAction) {
            const {taskId} = await createTask(this.websiteUrl, this.websiteKey, 'RecaptchaV3TaskProxylessM1', pageAction);
            let result = await getTaskResult(taskId);
            // 如果result为空，等待0.3分钟后再次请求
            if (!result) {
                await sleep(0.3);
                result = await getTaskResult(taskId);
            }
            // 如果再次为空，抛出错误
            if (!result) {
                throw new Error(`${pageAction} 人机验证失败`);
            }
            const { gRecaptchaResponse } = result.solution
            return gRecaptchaResponse
        }

        async dripToken() { 
            const gRecaptchaResponse = await this.recaptcha('dripToken');
            this.headers['authorization'] = `Bearer ${gRecaptchaResponse}`;
            const data = {
                'address': this.address,
            }
            const config = {
                headers: this.headers,
                httpsAgent: this.agent,
                httpAgent: this.agent,
                data: data,
                method: 'post',
            }
            const url = `https://artio-80085-ts-faucet-api-2.berachain.com/api/claim?address=${this.address}`;
            const res = await sendRequest(url, config);
            return res;
        }
    
        
}

module.exports = bearToken;
