/**
 *  项目名称： Skydrome
 * 项目链接：https://app.skydrome.finance/swap
 * 项目文档：https://docs.skydrome.finance/
 * GitHub：https://github.com/SkyDromeFinance
 * 已完成功能： swapETHForExactTokens, swapTokensForETH
 * 
 */

const ethers = require('ethers');
const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');
const coinAddress = require('../../../../config/tokenAddress.json').Scroll

class Skydrome {
    constructor() {
        this.name = 'Skydrome';
        this.routerAddr = '0x03290A52BA3164639067622E20B90857eADed299';
        this.stableRouterAddr = '0xAA111C62cDEEf205f70E6722D1E22274274ec12F';
        this.routerAbi = require('./abi/routerabi.json');
    };

    getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, wallet)
     };
    
    getStableRouter(wallet, stableRouterAddr=this.stableRouterAddr, routerAbi=this.routerAbi){
        return getContract(stableRouterAddr, routerAbi,wallet)
    };

    async swapEthToToken(wallet, min=ethers.BigNumber.from(0), tokenIn, tokenOut, amount){
        const router = this.getRouter(wallet);
        const routes = [
            {
                from: tokenIn,
                to: tokenOut,
                stable: false
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
        const stableRouter = this.getStableRouter(wallet);
        const usdt = await fetchToken(coinAddress.USDT, wallet);
        const routes = [
            {
                from: tokenIn,
                to: usdt.address,
                stable: true
            },
            {
                from: usdt.address,
                to: tokenOut,
                stable: false
            }
        ];
        const response = await stableRouter.swapExactTokensForETH(
            amount,
            min,
            routes,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
            );
        return await response.wait();

    }

    };

module.exports = Skydrome;