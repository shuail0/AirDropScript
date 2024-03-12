const { Wallet } = require('ethers');
const { getContract } = require('../../../../base/utils');

/**
 * 项目链接：https://app.zomma/pro
 * 项目文档：https://zomma-protocol.gitbook.io
 * 已完成功能： 存款(取款是通过paymaster完成的，未做)
 */


class zomma {
    constructor() {
        this.wETHAddr = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
        this.poolAddr = '0xdD5AE451A75a654146747235FDB515F06A55D018';
    

       
        this.Abi = require('./abi/IERC20.json');
        
    };


    async getPoolContract(wallet, poolAddr=this.poolAddr, poolAbi=this.Abi) {
        return getContract(poolAddr, poolAbi, wallet);
    };
   
    
    async deposit(wallet, amount){
        const pool = await this.getPoolContract(wallet);
        // const params = {value: amount};
         
        const response = await pool.deposit(amount);
        

        return await response.wait();
    };     

     
};

module.exports = zomma;