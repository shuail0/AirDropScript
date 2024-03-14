/**
 *  项目名称： zkSwap
 * 项目链接：https://app.zk-swap.xyz/swap
 * 项目文档：https://docs.zk-swap.xyz
 * GitHub：https://github.com/ZK-Swap-xyz
 * 已完成功能： Swap ETH to token
 * 
 */

const ethers = require('ethers');
const {  getContract } = require('../../../../base/utils');

// 定义 zkswap 类
class zkswap {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
        this.RouterAddress = '0x928687750e4db7f0BcA59495c4D009b9A76590C3';
        // this.FactoryAddress = '0x3a76e377ED58c8731F9DF3A36155942438744Ce3';
        // this.zfTokenAddress = '0x31C2c031fDc9d33e974f327Ab0d9883Eae06cA4A';
        // this.zfFarmAddress = '0x9F9D043fB77A194b4216784Eb5985c471b979D67';
        this.RouterAbi = require('../zkswap/abi/router.json');
    };

    // 获取路由合约
   async getRouter(wallet, RouterAddress = this.RouterAddress, routerAbi = this.RouterAbi) {
        return getContract(RouterAddress, routerAbi, wallet);
      };


    // 交换 ETH 到其他代币
    async swapExactInputSingle(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)){
        const router = await this.getRouter(wallet);
        const fee = 300;
        const response = await router.swapExactInputSingle(
            [
                tokenIn,
                tokenOut,
                fee,
                wallet.address,
                ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
                amount,
                min,
                0
            ],
            {
                value: amount
            }
        );
        //等待交易确认
        return await response.wait();
    };

}

// 导出 zkswap 类
module.exports = zkswap;
