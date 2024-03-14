/**
 * 项目名: sithswap
 * 项目地址：https://app.sithswap.com/
 * 项目文档：https://docs.sithswap.com/
 * 已经完成接口： swap
 */

const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');

class SithSwap {
    constructor(){
        this.routerAddr = '0x028c858a586fa12123a1ccb337a0a3b369281f91ea00544d0c086524b759f627',
        this.factoryAddr = '0xeaf728d8e09bfbe5f11881f848ca647ba41593502347ed2ec5881e46b57a32',

        this.routerAbi = require('./abi/router.json');
        this.factoryAbi = require('./abi/factory.json')
        this.zeroUint256 = floatToUint256(0)
    };


    getRouterContract(account, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, account);
    };
    
    getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn, isStable='1',amountOutMin=this.zeroUint256) {
        /**
         * isStable参数判断是否为稳定币交易对'0'=是，'1'=否。
         */
        const router = this.getRouterContract(account);
        const deadline = addSecondsToCurrentTimestamp(360);
        const callData = router.populate(
            'swapExactTokensForTokensSupportingFeeOnTransferTokens',
            {
                amount_in: bigNumbetToUint256(amountIn),
                amount_out_min: amountOutMin,
                routes_len: '1',
                routes: [
                    {
                        from_address: tokenIn,
                        to_address: tokenOut,
                        stable: isStable
                    }

                ],
                to: account.address,
                deadline: deadline.toString()
            }
        );
        return callData
    };
    getSwapExactTokensForTokensSimpleCallData(account, tokenIn, tokenOut, amountIn, amountOutMin=this.zeroUint256) {
        /**
         * 简单交易模式
         */
        const router = this.getRouterContract(account);
        const deadline = addSecondsToCurrentTimestamp(360);
        const callData = router.populate(
            'swapExactTokensForTokensSimple',
            {
                amount_in: bigNumbetToUint256(amountIn),
                amount_out_min: amountOutMin,
                token_from: tokenIn,
                token_to: tokenOut,
                to: account.address,
                deadline: deadline.toString()
            }
        );
        return callData
    }
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
    async swapTokenToToken(account, tokenIn, tokenOut, amountIn, isStable='1') {
        /**
         * isStable参数判断是否为稳定币交易对'0'=是，'1'=否。
         */
        const approveCallData = getApproveCallData(tokenIn, this.routerAddr, amountIn);
        const swapCallData = this.getSwapTokenToTokenCallData(account, tokenIn, tokenOut,amountIn, isStable);
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

module.exports = SithSwap;
