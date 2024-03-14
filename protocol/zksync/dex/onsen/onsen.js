
/**
 *  项目名称： Onsen
 * 项目链接：https://app.onsenswap.xyz
 * 项目文档：https://onsenswap.gitbook.io/onsen
 * GitHub：
 * 已完成功能： SwapETHForExactTokens
 */

const ethers = require('ethers');
const {  getContract } = require('../../../../base/utils');

// 定义 onsenswap 类
class onsenswap {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
        this.RouterAddress = '0x421b7B7e1b8c7E3b78BFF3e5F508357B004d56Fb';
        this.ETHAddress = '0x0000000000000000000000000000000000000000';
        this.RouterAbi = require('../onsen/abi/OnsenRouter.json');
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
            this.ETHAddress,
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

// 导出 onsenswap 类
module.exports = onsenswap;
