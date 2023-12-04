/**
 * 项目名称：SpaceFi
 * 项目链接：https://app.spacefi.io/#/home
 * 项目文档：https://docs.spacefi.io/
 * GitHub：
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth
 * 
 */

const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');


class SpaceFi {
    constructor() {
        this.routerAddr = '0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d'

        this.routerAbi = require('./abi/router.json');
     }
    async getRouter(wallet) {
        return getContract(this.routerAddr, this.routerAbi, wallet);
    };
    async getFactory(wallet, factoryAddr, factoryAbi) {
        return getContract(factoryAddr, factoryAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const params = {
            value:amount
        };
        // console.log('path', ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800))
        const response = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
        );
        return await response.wait();

    }

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
        );
        return await response.wait();
    }

    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
        );
        return await response.wait();
    }
}

module.exports = SpaceFi;