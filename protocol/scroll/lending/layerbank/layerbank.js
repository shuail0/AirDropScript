/**
 *  项目名称： Layerbank
 * 项目链接：https://scroll.layerbank.finance/bank
 * 项目文档：https://docs.layerbank.finance
 * GitHub：https://github.com/layerbank/contracts
 * 已完成功能： supply, redeemUnderlying
 * 
 */

const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class LayerBank {
    constructor(wallet) {
        this.wallet = wallet;
        this.lETHAddr = '0x274C3795dadfEbf562932992bF241ae087e0a98C';
        this.core = '0xec53c830f4444a8a56455c6836b5d2aa794289aa';
      

        this.Abi = require('./abi/coreabi.json');
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
        const response = await CoreContract.redeemUnderlying(this.lETHAddr, amount);
        return await response.wait();

    }

    };

module.exports = LayerBank;