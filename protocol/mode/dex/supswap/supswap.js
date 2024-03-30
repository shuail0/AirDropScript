/**
 * 项目名称：SupSwap
 * 项目链接：https://supswap.xyz/
 * 项目文档：https://docs.supswap.xyz/
 * GitHub：https://github.com/supswap/
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth, mintLiquidityPosition, increaseLiquidity, decreaseLiquidity
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { getContract, floatToFixed, convertCSVToObjectSync } = require('../../../../base/utils');
const { FeeAmount } = require('@uniswap/v3-sdk');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');

class SupSwap {
    constructor(wallet) {
        this.wallet = wallet;
        this.routerAddr = '0x016e131C05fb007b5ab286A6D614A5dab99BD415';
        this.routerAbi = require('./abi/router.json');
    };

    getRouter() {
        return getContract(this.routerAddr, this.routerAbi, this.wallet);
    };

    getExactInputSingleCallData(tokenIn, tokenOut, amount, fee, min, recipient) {
        const router = this.getRouter();
        return router.interface.encodeFunctionData('exactInputSingle', [
            [
                tokenIn,
                tokenOut,
                fee,
                recipient,
                amount,
                min,
                floatToFixed(0)
            ]
        ]);
    };

    async swapEthToToken(tokenIn, tokenOut, amount, fee, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, amount, fee, min, this.wallet.address);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall(ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), [callData], { value: amount, gasPrice });
        return await response.wait();
    };
    async swapTokenToToken(tokenIn, tokenOut, amount, fee, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, amount, fee, min, this.wallet.address);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall(ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), [callData], { gasPrice });
        return await response.wait();
    };

    async swapTokenToEth(tokenIn, tokenOut, amount, fee, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData( tokenIn, tokenOut, amount, fee, min, '0x0000000000000000000000000000000000000002');
        const unwrapWETH9CallData = router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            this.wallet.address
        ])
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await router.multicall(ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), [callData, unwrapWETH9CallData], { gasPrice });
        return await response.wait();
    };

};

module.exports = SupSwap;

