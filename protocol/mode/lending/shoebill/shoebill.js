/**
 *  项目名称： Shoebill
 * 项目链接：https://mode-eth.shoebill.finance
 * 项目文档：https://docs.shoebill.finance
 * GitHub：
 * 已完成功能： mint, redeem  
 * 
 */

const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class ShoeBill {
    constructor(wallet) {
        this.wallet = wallet;
        this.sbStoneAddr = '0x8EeA9ED0d547457fEF88fBF459BF8a18fb04d277';
        this.Abi = require('./abi/cErc20abi.json');
    };

    getCoreContract(sbStoneAddr=this.sbStoneAddr, abi=this.Abi){
        return getContract(sbStoneAddr, abi, this.wallet)
     };

    async supply(amount){
        const sbStoneContract = this.getCoreContract();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const response = await sbStoneContract.mint(amount, {gasPrice: gasPrice});
        return await response.wait();
    };

    async redeemToken(amount){
        const sbStoneContract = this.getCoreContract();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const response = await sbStoneContract.redeem(amount, {gasPrice});
        return await response.wait();
    }

    };

module.exports = ShoeBill;