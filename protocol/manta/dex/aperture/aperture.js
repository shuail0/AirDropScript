/**
 * 项目名称：AperTure exchange
 * 项目链接：app.aperture.finance
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

class AperTure {
    constructor(wallet) {
        this.wallet = wallet;
        this.swapRouterAddr = '0x3488d5A2D0281f546e43435715C436b46Ec1C678';
        this.swapRouterAbi = require('./abi/swapRouter.json');
    };

    getRouter() {
        return getContract(this.swapRouterAddr, this.swapRouterAbi, this.wallet);
    };

    getExactInputSingleCallData(tokenIn, tokenOut, fee, amount, min, recipient) {
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

    async swapEthToToken(tokenIn, tokenOut, fee, amount, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, fee, amount, min, '0x0000000000000000000000000000000000000001');
        const ddl = ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(90).div(100); // 减少85%的gasPrice
        const response = await router.multicall(ddl, [callData], { value: amount, gasPrice});
        return await response.wait();
    };
    async swapTokenToToken(tokenIn, tokenOut, fee, amount, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(90).div(100); // 减少85%的gasPrice
        const callData = this.getExactInputSingleCallData(tokenIn, tokenOut, fee, amount, min, '0x0000000000000000000000000000000000000001');
        const ddl = ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);
        const response = await router.multicall(ddl, [callData], { gasPrice });
        return await response.wait();
    };

    async swapTokenToEth(tokenIn, tokenOut, fee, amount, min = ethers.BigNumber.from(0), ) {
        const router = this.getRouter();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        const callData = this.getExactInputSingleCallData( tokenIn, tokenOut, fee, amount, min, '0x0000000000000000000000000000000000000002');
        const unwrapWETH9CallData = router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0)
        ])
        const ddl = ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800);
        const response = await router.multicall(ddl, [callData, unwrapWETH9CallData], { gasPrice });
        return await response.wait();
    };

};

module.exports = AperTure;

