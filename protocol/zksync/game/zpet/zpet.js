
const ethers = require('ethers');
const {  getContract } = require('../../../../base/utils');


class zpet {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
        this.RouterAddress = '0x18381c0f738146Fb694DE18D1106BdE2BE040Fa4';
        this.zpetAddress = '0x0C6eaaAb86e8374A91e3F42c726B6FD1aBaCB54c';
        this.zpetAddress = '0xFabb6de2FCA082AAe5F74268F939Fe7ef1C1dB83';
        this.zpetAbi = require('../zpet/abi/zpetAbi.json');
        this.RouterAbi = require('../zpet/abi/ZFRouter.json');
    };

    async getRouter(wallet, RouterAddress = this.RouterAddress, routerAbi = this.RouterAbi) {
        return getContract(RouterAddress, routerAbi, wallet);
      }
    async getZpet(wallet, zpetAddress = this.zpetAddress, zpetAbi = this.zpetAbi) {
        return getContract(zpetAddress, zpetAbi, wallet);
    }

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
        return await response.wait();
    }

    async mintZpet(wallet) {
        const zpet = await this.getZpet(wallet);
        const address = '0x0000000000000000000000000000000000000000'
        const bytes = '0x'

        const response = await zpet.mint(address,bytes);
        return await response.wait();
    }
}

module.exports = zpet;