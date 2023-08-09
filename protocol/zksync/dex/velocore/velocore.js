const ethers = require('ethers');
// const Dex = require('../../../module/dex.js');
const { getContract } = require('../../../../base/utils');

class Velocore {
    constructor() {
        this.name = 'velocore';
        this.routerAddr = '0xd999E16e68476bC749A28FC14a0c3b6d7073F50c';
        this.factoryAddr = '0xE140EaC2bB748c8F456719a457F26636617Bb0E9';
        this.routerAbi = require('./abi/Router.json');
        this.factoryAbi = require('./abi/pairFactory.json');
        // this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
    };
    
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=false) { 
        const router = await this.getRouter(wallet)
        const routes = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: isStable,
                factory: this.factoryAddr
            }
        ];
        const params = {
            value:amount
        };
        const response = await router.swapExactETHForTokens(
            min, 
            routes,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params 
            )
        return await response.wait();

    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0),isStable=false) { 
        const router = await this.getRouter(wallet);
        const routers = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: isStable,
                factory: this.factoryAddr
            }
        ];
        const reponse = await router.swapExactTokensForTokens(
            amount,
            min,
            routers,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
        )
        return await reponse.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=false) {
        const router = await this.getRouter(wallet);
        const routes = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: isStable,
                factory: this.factoryAddr
            }
        ];
        const response = await router.swapExactTokensForETH(
            amount,
            min, 
            routes,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
            )
        return await response.wait();
     };
}

module.exports = Velocore;