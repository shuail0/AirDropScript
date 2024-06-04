/**
 *  项目名称： SpaceSwap
 * 项目链接：https://swap-zksync.spacefi.io/#/swap
 * 项目文档：https://docs.spacefi.io/
 * GitHub：
 * 已完成功能： swapExactETHForTokens
 * 
 */

const ethers = require('ethers');
const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class SpaceSwap {
    constructor() {
        this.name = 'SpaceSwap';
        this.routerAddr = '0x18b71386418A9FCa5Ae7165E31c385a5130011b6';
        this.routerAbi = require('./abi/routerabi.json');
    };

    getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, wallet)
     };

    async swapEthToToken(wallet, min=ethers.BigNumber.from(0), tokenIn, tokenOut, amount){
        const router = this.getRouter(wallet);
        const path = [
            tokenIn,
            tokenOut
            ];
        const params = {value: amount};
        const response = await router.swapExactETHForTokens(
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
            );
        return await response.wait();
    };

    async swapTokenToEth(wallet, amount, min=ethers.BigNumber.from(0), tokenIn, tokenOut){
        const router = this.getRouter(wallet);
        const path = [
            tokenIn,
            tokenOut
        ];
        const response = await router.swapExactTokensForETH(
            amount,
            min,
            path,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
            );
        return await response.wait();

    }

    };

module.exports = SpaceSwap;