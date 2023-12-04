const ethers = require('ethers');
const {  getContract } = require('../../../../base/utils');

// 定义 zkswap 类
class zkswap {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
        this.RouterAddress = '0x18381c0f738146Fb694DE18D1106BdE2BE040Fa4';
        this.FactoryAddress = '0x3a76e377ED58c8731F9DF3A36155942438744Ce3';
        this.zfTokenAddress = '0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A';
        this.zfFarmAddress = '0x9F9D043fB77A194b4216784Eb5985c471b979D67';
        this.RouterAbi = require('../zkswap/abi/ZFRouter.json');
    };

    // 获取路由合约
    async getRouter(wallet, RouterAddress = this.RouterAddress, routerAbi = this.RouterAbi) {
        return getContract(RouterAddress, routerAbi, wallet);
      };

    // 交换 ETH 到其他代币
    async swapExactETHForTokens(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const params = {
            value:amount
        };
        const response = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
        );
        // 等待交易确认
        return await response.wait();
    };

    // 交换其他代币到 ETH
    async swapExactTokensForETH(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const params = {
            gasPrice: await wallet.getGasPrice(),
            gasLimit: await router.estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(amount,min,path,wallet.address,ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800))
          };


        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount, 
            min, 
            path, 
            wallet.address, 
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), 
            params,
        );
        return await response.wait(); 
    };


    async addLiquidity(wallet, tokenA, tokenB, amountTokenInExpected, amountTokenInMin, to, deadline) { 
        const router = await this.getRouter(wallet);
        const response = await router.addLiquidity(
            tokenA,
            tokenB,
            amountTokenInExpected,
            amountTokenInMin,
            amountETHInMin,
            to,
            deadline
        );
        return await response.wait();
    };

    async removeLiquidity(wallet, tokenA, tokenB, liquidity, amountTokenMin, amountETHMin , to, deadline) {
        const router = await this.getRouter(wallet);
        const response = await router.removeLiquidity(
            tokenA,
            tokenB,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline
        );
        return await response.wait();
    };

};

// 导出 zkswap 类
module.exports = zkswap;
