
/**
 * 项目名称： cog
 * 项目链接: https://www.cog.finance/deposit
 * 项目文档：https://docs.cog.finance/  
 * GitHub：https://github.com/CogFinance/Cog-Isolated-Lending/blob/main/deployments/mainnet.md
 * 已完成功能： 
 * 
 */

const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class CogFinance {
    constructor(wallet) {
        this.wallet = wallet;
        this.cogPairContractAddr = '0x63fdafa50c09c49f594f47ea7194b721291ec50f';

        this.cogPairAbi = require('./abi/cogpairabi.json');
    };

    
    getcogPairContract(cogPairContractAddr=this.cogPairContractAddr, cogPairAbi=this.cogPairAbi ){
        return getContract(cogPairContractAddr, cogPairAbi, this.wallet)
    };

    

    async supplyToken(wallet, amount) {
        const cogPairContract = this.getcogPairContract();
        // 存入资产
        const response = await cogPairContract.add_collateral(wallet.address, amount);
        return await response.wait();
    };

    //读取存入的wETH金额
    async getCollateralAmount(wallet){
        const cogPairContract = this.getcogPairContract();
        return await cogPairContract.user_collateral_share(wallet.address);
    };

    async withdrawToken(wallet, amount) {
        const cogPairContract = this.getcogPairContract();
        const response = await cogPairContract.remove_collateral(wallet.address, amount);
        return await response.wait();
    }

};

module.exports = CogFinance;