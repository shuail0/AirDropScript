
/**
 * 项目名称：swapMode
 * 项目链接：https://swapmode.fi/swap
 * 项目文档：
 * GitHub：https://github.com/swapmode
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth
 * 
 */

const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class SwapMode {
    constructor(wallet) {
        this.name = 'swapMode';
        this.wallet = wallet;
        this.routerAddr = '0xc1e624C810D297FD70eF53B0E08F44FABE468591';
        this.routerAbi = require('./abi/Router.json');
    };

    async getRouter() {
        return getContract(this.routerAddr,this.routerAbi, this.wallet);
    };

    async swapEthToToken(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const router = await this.getRouter();
        const path = [tokenIn, tokenOut];
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        const params = {
            value: amount,
            gasPrice
        };
        const response = await router.swapExactETHForTokens(
            min,
            path,
            this.wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
        );
        return await response.wait();

    };

    async swapTokenToToken(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const router = await this.getRouter();
        const path = [tokenIn, tokenOut];
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        const response = await router.swapExactTokensForTokens(
            amount,
            min,
            path,
            this.wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            { gasPrice }
        );
        return await response.wait();
    };

    async swapTokenToEth(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const router = await this.getRouter();
        const path = [tokenIn, tokenOut];
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        const response = await router.swapExactTokensForETH(
            amount,
            min,
            path,
            this.wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            { gasPrice }
        );
        return await response.wait();
    };
};

module.exports = SwapMode;