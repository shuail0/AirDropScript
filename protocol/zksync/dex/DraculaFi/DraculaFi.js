/**
 * 项目名称： DraculaFi
 * 项目链接：https://draculafi.xyz/
 * 项目文档：https://draculafi.gitbook.io/draculafi/
 * GitHub：
 * 已完成功能： swapEthToToken, swapTokenToEth
 * 
 */
const ethers = require('ethers');
// const Dex = require('../../../module/dex.js');
const { getContract } = require('../../../../base/utils');

class DraculaFi {
    constructor() {
        this.name = 'DraculaFi';
        this.routerAddr = '0x4D88434eDc8B7fFe215ec598C2290CdC6f58d12D';
        this.factoryAddr = '0x68e03D7B8B3F9669750C1282AD6d36988f4FE18e';
        this.routerAbi = require('./abi/DraculaRouter01.json');
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

module.exports = DraculaFi;