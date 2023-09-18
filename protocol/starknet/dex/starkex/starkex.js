/**
 * 项目名: starkes
 * 项目地址：https://app.starkex.org/
 * 项目文档：https://docs.starkex.org/ (无法访问)
 * 项目Git：https://github.com/cantlee/StarkExContracts
 * 已经完成接口： swap
 */

const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');

class StarkEx {
    constructor() {
        this.routerAddr = '0x07ebd0e95dfc4411045f9424d45a0f132d3e40642c38fdfe0febacf78cc95e76',
            this.factoryAddr = '0x7df3bce30857e8f9c08bcd9d9668df34166e94dd968db6e2920b870c4410e34',

            this.routerAbi = require('./abi/router.json');
        this.factoryAbi = require('./abi/factory.json');
        this.zeroUint256 = floatToUint256(0);
    };


    getRouterContract(account, routerAddr = this.routerAddr, routerAbi = this.routerAbi) {
        return getContract(routerAddr, routerAbi, account);
    };

    getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn, amountOutMin = this.zeroUint256) {
        const router = this.getRouterContract(account);
        const deadline = addSecondsToCurrentTimestamp(360);
        const callData = router.populate(
            'swapExactTokensForTokens',
            {
                amountIn: bigNumbetToUint256(amountIn),
                amountOutMin: amountOutMin,
                path_len: '2',
                path: [tokenIn, tokenOut],
                to: account.address,
                deadline: deadline.toString()
            }
        );
        return callData
    };
    // getAddLiquidityToPoolCallData(account, tokenA, tokenB, amountA, amountB) {
    //     const router = this.getRouterContract(account);
    //     const callData = router.populate(
    //         'add_liquidity',
    //         {
    //             tokenA: tokenA,
    //             tokenB: tokenB,
    //             amountADesired: bigNumbetToUint256(amountA),
    //             amountBDesired: bigNumbetToUint256(amountB),
    //             amountAMin: multiplyUint256ByFraction(bigNumbetToUint256(amountA), 0.98),
    //             amountBMin: multiplyUint256ByFraction(bigNumbetToUint256(amountB),0.98),
    //             to: account.address,
    //             deadline: addSecondsToCurrentTimestamp(360)
    //         }
    //     );
    //     return callData;
    // };
    // getRemoveLiquidityCallData(account, tokenA, tokenB, liquidity) {
    //     const router = this.getRouterContract(account);
    //     const callData = router.populate(
    //         'remove_liquidity',
    //         {
    //             tokenA: tokenA,
    //             tokenB: tokenB,
    //             liquidity: bigNumbetToUint256(liquidity),
    //             amountAMin: this.zeroUint256,
    //             amountBMin: this.zeroUint256,
    //             to: account.address,
    //             deadline: addSecondsToCurrentTimestamp(360) 
    //         }
    //     )
    //     return callData
    // };
    // getApproveLPcallData(account, pairAddr, spender, amount) {
    //     const lpToken = this.getPairContract(account, pairAddr);
    //     const callData = lpToken.populate(
    //         'approve',
    //         {
    //             spender: spender,
    //             amount: bigNumbetToUint256(amount),
    //         }
    //     );
    //     return callData;
    // };
    // async getLPBalance(account, pairAddr) {
    //     // 获取LP余额，返回bigNumber类型的数据
    // };
    // async getToken0andToek1Addr(account, pairAddr){
    //     // 获取Pair中两个Token的位置
    //     };
    // };
    // async getReserves(account, pairAddr){
    //     /**
    //      * 获取pair中2个资产储备量
    //      */
    //     }
    // };
    // async getQuote(account, tokenA, tokenB, amountA){
    //     /**
    //      * 获取报价，用于LP计算;
    //      * amountA: tokenA的数量
    //      * reserveA: tokenA在Pool中的储备数量
    //      * reserveB: tokenB在Pool中的储备数量
    //      */ 
    // };
    async swapTokenToToken(account, tokenIn, tokenOut, amountIn) {
        const approveCallData = getApproveCallData(tokenIn, this.routerAddr, amountIn);
        const swapCallData = this.getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn);
        const multiCallData = [approveCallData, swapCallData];
        return await multiCallContract(account, multiCallData);
    };

    // async addLiquidityToPool(account, tokenA, tokenB, amountA, amountB) {
    //     const tokenAApproveCallData = getApproveCallData(tokenA, this.routerAddr, amountA);
    //     const tokenBApproveCallData = getApproveCallData(tokenB, this.routerAddr, amountB);
    //     const addLiquidityCallData = this.getAddLiquidityToPoolCallData(account, tokenA, tokenB, amountA, amountB);
    //     const multiCallData = [tokenAApproveCallData, tokenBApproveCallData, addLiquidityCallData];
    //     return await multiCallContract(account, multiCallData)
    //  };

    // async removeLiquidityForPool(account, tokenA, tokenB) {
    //     const pairAddr = await this.getPairAddr(account, tokenA, tokenB);
    //     const lpBalance = await this.getLPBalance(account, pairAddr);
    //     const approveLPCallData = this.getApproveLPcallData(account, pairAddr, this.routerAddr, lpBalance);
    //     const removeLiquidityCallData = this.getRemoveLiquidityCallData(account, tokenA, tokenB, lpBalance);
    //     const multiCallData = [approveLPCallData, removeLiquidityCallData];
    //     return await multiCallContract(account, multiCallData);
    //  };
};

module.exports = StarkEx;
