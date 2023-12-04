/**
 * 项目名称：ezkalibur
 * 项目链接：https://ezkalibur.com/
 * 项目文档：https://app.gitbook.com/o/rGi5L9T2u2PeY9QDrzvp/s/HNQ8zWiQWYZ9V6sWTXuc/
 * GitHub：https://github.com/ezkalibur
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { defaultAbiCoder } = require('@ethersproject/abi');
const { getContract } = require('../../../../base/utils');

class Ezkalibur {
    constructor() {
        this.name = 'ezkalibur';
        this.routerAddr = '0x498f7bB59c61307De7dEA005877220e4406470e9';
        this.factoryAddr = '0x15C664A62086c06D43E75BB3fddED93008B8cE63';
        this.routerAbi = require('./abi/router.json');
        this.factoryAbi = require('./abi/factory.json');
        // this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
    };
    
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const params = {
            value: amount
        }
        const response = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            min,
            path,
            wallet.address,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            params
        );
        return await response.wait();

    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800)
        );
        return await response.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const path = [tokenIn, tokenOut];
        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amount,
            min,
            path,
            wallet.address,
            wallet.address,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
        );
        return await response.wait();
     };
};

module.exports = Ezkalibur;