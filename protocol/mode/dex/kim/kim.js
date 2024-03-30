/**
 * 项目名称：Kim exchange
 * 项目链接：https://app.kim.exchange/
 * 项目文档：https://docs.kim.exchange/
 * GitHub：
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth, mintLiquidityPosition, increaseLiquidity, decreaseLiquidity
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { getContract, floatToFixed, convertCSVToObjectSync } = require('../../../../base/utils');
const { FeeAmount } = require('@uniswap/v3-sdk');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');

class Kim {
    constructor(wallet) {
        this.wallet = wallet;
        this.swapRouterAddr = '0xAc48FcF1049668B285f3dC72483DF5Ae2162f7e8';
        this.swapRouterAbi = require('./abi/swapRouter.json');
    };

    getRouter() {
        return getContract(this.swapRouterAddr, this.swapRouterAbi, this.wallet);
    };

    getExactInputSingleCallData(tokenIn, tokenOut, amount, min, recipient) {
        const router = this.getRouter();
        return router.interface.encodeFunctionData('exactInputSingle', [
            [
                tokenIn,
                tokenOut,
                recipient,
                ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
                amount,
                min,
                floatToFixed(0)
            ]
        ]);
    };

    async swapEthToToken(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, amount, min, this.wallet.address);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall([callData], { value: amount, gasPrice });
        return await response.wait();
    };
    async swapTokenToToken(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, amount, min, this.wallet.address);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall([callData], { gasPrice });
        return await response.wait();
    };

    async swapTokenToEth(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0), ) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData( tokenIn, tokenOut, amount, min, '0x0000000000000000000000000000000000000000');
        const unwrapWETH9CallData = router.interface.encodeFunctionData('unwrapWNativeToken', [
            floatToFixed(0),
            this.wallet.address
        ])
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall([callData, unwrapWETH9CallData], { gasPrice });
        return await response.wait();
    };

};

module.exports = Kim;

