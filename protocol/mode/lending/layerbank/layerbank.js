/**
 *  项目名称： Layerbank
 * 项目链接：https://mode.layerbank.finance/bank
 * 项目文档：https://docs.layerbank.finance
 * GitHub：https://github.com/layerbank/contracts
 * 已完成功能： supply, redeemToken
 * 
 */

const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class LayerBank {
    constructor(wallet) {
        this.wallet = wallet;
        this.lETHAddr = '0xe855b8018c22a05f84724e93693caf166912add5';
        this.core = '0x80980869D90A737aff47aBA6FbaA923012C1FF50';
      

        this.Abi = require('./abi/abi.json');
    };

    getCoreContract(coreAddr=this.core, abi=this.Abi){
        return getContract(coreAddr, abi, this.wallet)
     };

    async supply(amount){
        const CoreContract = this.getCoreContract();
        const response = await CoreContract.supply(this.lETHAddr, amount, {value: amount});
        return await response.wait();
    };

    async redeemToken(amount){
        const CoreContract = this.getCoreContract();
        const response = await CoreContract.redeemToken(this.lETHAddr, amount);
        return await response.wait();

    }

    };

module.exports = LayerBank;