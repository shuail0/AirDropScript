const { Wallet } = require('ethers');
const { getContract } = require('../../../../base/utils');

/**
 * 项目链接：https://zkfox.io
 * 项目文档：https://docs.zkfox.io/
 * 已完成功能： 存取款（WETH）
 */


class PixelSwap {
    constructor() {
        this.wETHAddr = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
        
       
        this.TokenAbi = require('./abi/pixelswap.json');
        
    };


    getTokenContract(wallet, TokenAddr=this.wETHAddr, TokenAbi=this.TokenAbi) {
        return getContract(TokenAddr, TokenAbi, wallet);
    };

    
    async deposit(wallet, amount){
        const TokenContract = this.getTokenContract(wallet, this.wETHAddr, this.TokenAbi);
        const params = {value: amount};

        // const params = {
        //       gasPrice: await wallet.getGasPrice(),
        //       gasLimit: await fTokenContract.estimateGas.mint(amount)//预估eth gas
            
        //     };
        
        //     console.log('params:', params);
            
        const response = await TokenContract.deposit(params);
        return await response.wait();
    };     

    async withdraw(wallet, amount){
        const TokenContract = this.getTokenContract(wallet, this.wETHAddr, this.TokenAbi);
        const response = await TokenContract.withdraw(amount);
        return await response.wait();
    }
     
};

module.exports = PixelSwap;