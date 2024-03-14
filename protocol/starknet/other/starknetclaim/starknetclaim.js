/**
 * 项目名: starknetClaim
 * 项目地址：
 * 项目文档：
 */

const { default: axios } = require('axios');
const { getApproveCallData, getBalance } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, feltToInt, floatToUint256, strToFelt, bigNumbetToUint256 } = require('../../../../base/stkUtils.js')
const { createTask, getTaskResult } = require('../../../../base/yesCaptCha/yescaptcha.js');



class StarknetClaim {
    constructor() {

        this.claimContractAbi = require('./abi/starknetclaim.json')
        this.claimContractAddr = '0x06793d9e6ed7182978454c79270e5b14d2655204ba6565ce9b0aa8a3c3121025'

    };


    getClaimContract(account) {
        return getContract(this.claimContractAddr, this.claimContractAbi, account);
    };

    getClaimCallData(account, amount) {
        // 取出所有存款
        const claimContract = this.getClaimContract(account);
        const callData = claimContract.populate(
            'claim',
            [{
                identity: account.address,
                balance: floatToUint256(amount),
                index: 1,
                'merkle_path': [account.address, account.address]
            }]
        );
        return callData
    };

    async recaptcha(pageAction) {
        const { taskId } = await createTask('https://provisions.starknet.io/', '6Ldj1WopAAAAAGl194Fj6q-HWfYPNBPDXn-ndFRq', 'RecaptchaV3TaskProxyless', pageAction);
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

    async getAirdropAmount(account) {
        // const taskInfo = createTask()
        const url = `https://starknetairdrop-batch-check.vercel.app/api/tokens`;
        const params = { "categorizedAddresses": { "0": [account.address] } };
        const response = await axios.post(url, params);
        // console.log(response.data[account.address]);
        return response.data[account.address];
    }



    async claim(account, amount) {
        const callData = this.getClaimCallData(account, amount);
        const multiCallData = [callData];
        return await multiCallContract(account, multiCallData);
    };


};

module.exports = StarknetClaim;