/**
 * 项目名: dediswap
 * 项目地址：https://app.jediswap.xyz/#/swap
 * 项目文档：https://docs.jediswap.xyz/
 */


const { getApproveCallData, getBalance } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, feltToInt, floatToUint256, multiplyBigIntByFraction, addSecondsToCurrentTimestamp } = require('../../../../base/stkUtils.js');
const { CallData } = require('starknet');

class JediSwap {
    constructor() {
        this.router = '0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023',
        this.factory = '0x00dad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd',

        this.routerAbi = require('./abi/router.json'),
        this.factoryAbi = require('./abi/factory.json'),
        this.pairAbi = require('./abi/pair.json')


        this.zeroUint256 = floatToUint256(0)
    };

    getSwapTokenToTokenCallData(path, to, amountIn, amountOutMin = this.zeroUint256) {

        const pathLen = String(path.length);
        const deadline = addSecondsToCurrentTimestamp(360); // 最长360秒
        const params = {
            contractAddress: this.router,
            entrypoint: 'swap_exact_tokens_for_tokens',
            calldata: CallData.compile({
                amountIn: amountIn,
                amountOutMin: amountIn,
                path_len: pathLen,
                path: path,
                to: to,
                deadline: deadline.toString()
            })
        };
        return params;
    };
    getAddLiquidityToPoolCallData(tokenA, tokenB, amountA, amountB, to) {
        const params = {
            contractAddress: this.router,
            entrypoint: 'add_liquidity',
            calldata: CallData.compile({
                tokenA: tokenA,
                tokenB: tokenB,
                amountADesired: amountA,
                amountBDesired: amountB,
                amountAMin: multiplyBigIntByFraction(amountA, 0.98),
                amountBMin: multiplyBigIntByFraction(amountB, 0.98),
                to: to,
                deadline: addSecondsToCurrentTimestamp(360)
            })
        };
        return params;
    };
    // async getPool() { };

    async swapTokenToToken(account, tokenIn, tokenOut, amountIn) {
        const approveCallData = getApproveCallData(tokenIn, this.router, amountIn);
        const swapCallData = this.getSwapTokenToTokenCallData([tokenIn, tokenOut], account.address, amountIn);
        // console.log(swapCallData)
        // const multiCallData = [approveCallData, swapCallData];
        const multiCallData = [approveCallData]
        console.log(multiCallData)
        // return await multiCallContract(account, multiCallData);
    };

    async addLiquidityToPool(account, tokenA, tokenB, amountA, amountB, amountAMin, amountBMin) { };

    async removeLiquidityForPool() { };



};

module.exports = JediSwap;