/**
 *  项目名称： ToKan Exchange
 * 项目链接：https://app.tokan.exchange/swap
 * 项目文档：https://docs.tokan.exchange
 * GitHub：
 * 已完成功能： 
 * 
 */

const ethers = require('ethers');
const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class Tokan {
    constructor() {
        this.name = 'Tokan';
        this.CHIAddr = '0x2fC5cf65Fd0a660801f119832B2158756968266D';
        this.routerAddr = '0xa663c287b2f374878c07b7ac55c1bc927669425a';
        this.routerAbi = require('./abi/routerabi.json');
    };

    getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, wallet)
     };

    async swapEthToToken(wallet, min=ethers.BigNumber.from(0), tokenIn, tokenOut, amount){
        const router = this.getRouter(wallet);
        const routes = [
            {
                from: tokenIn,
                to: this.CHIAddr,
                stable: false
            },
            {
                from: this.CHIAddr,
                to: tokenOut,
                stable: true
            }
        ];
        const params = {value: amount};
        const response = await router.swapExactETHForTokens(
            min,
            routes,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
            );
        return await response.wait();
    };

    async swapTokenToEth(wallet, amount, min=ethers.BigNumber.from(0), tokenIn, tokenOut){
        const router = this.getRouter(wallet);
        const routes = [
            {
                from: tokenIn,
                to: this.CHIAddr,
                stable: true
            },
            {
                from: this.CHIAddr,
                to: tokenOut,
                stable: false
            }
        ];
        const response = await router.swapExactTokensForETH(
            amount,
            min,
            routes,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
            );
        return await response.wait();

    }

    };

module.exports = Tokan;