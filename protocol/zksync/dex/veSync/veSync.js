/**
 * 项目名称： veSync
 * 项目链接：https://app.vesync.finance/swap
 * 项目文档：https://docs.vesync.finance/introduction/vesync
 * GitHub：
 * 已完成功能： swapEthToToken, swapTokenToEth
 * 
 */
const ethers = require('ethers');
// const Dex = require('../../../module/dex.js');
const { getContract } = require('../../../../base/utils');

class veSyncSwap {
    constructor() {
        this.name = 'veSyncSwap';
        this.routerAddr = '0x6C31035D62541ceba2Ac587ea09891d1645D6D07';
        this.factoryAddr = '0x529Bd7Fc43285B96f1e8d5158626d1F15bb8A834';
        this.routerAbi = require('./abi/Router.json');
        // this.factoryAbi = require('./abi/IFactory.json');
        // this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
    };
    
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=false) { 
        const router = await this.getRouter(wallet)
        // const routes = [[tokenIn, tokenOut]]
        
        const routes = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: isStable
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

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), isStable=false) {
        const router = await this.getRouter(wallet);
        
        const routes = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: isStable
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

    // async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0),isStable=false) { 
    //     const router = await this.getRouter(wallet);
    //     const routers = [
    //         {
    //             from: tokenIn,
    //             to: tokenOut,
    //             stable: isStable,
    //             factory: this.factoryAddr
    //         }
    //     ];
    //     const reponse = await router.swapExactTokensForTokens(
    //         amount,
    //         min,
    //         routers,
    //         wallet.address,
    //         ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
    //     )
    //     return await reponse.wait();
    // };
}

module.exports = veSyncSwap;