const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class Mute {
    constructor() {
        this.name = 'mute';
        this.routerAddr = '0x8B791913eB07C32779a16750e3868aA8495F5964';
        this.factoryAddr = '0x40be1cBa6C5B47cDF9da7f963B6F761F4C60627D';
        this.routerAbi = require('./abi/Router.json');
        this.factoryAbi = require('./abi/factory.json');
        // this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
    };
    
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=[true, false]) { 
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
            isStable,
            params
        );
        return await response.wait();

    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0),isStable=[false, false]) { 
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            isStable
        );
        return await response.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=[false, false]) {
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            isStable
        );
        return await response.wait();
     };
};

module.exports = Mute;