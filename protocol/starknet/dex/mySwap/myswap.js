/**
 * 项目名: mySwap
 * 项目地址：https://www.myswap.xyz/
 * 项目文档：
 * 已经完成接口： swap
 */

const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');

class MySwap {
    constructor(){
        this.routerAddr = '0x010884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28',
        this.routerAbi = require('./abi/router.json');
        this.zeroUint256 = floatToUint256(0)
    };


    getRouterContract(account, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, account);
    };
    
    async getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn, amountOutMin = this.zeroUint256) {
        const poolId = await this.getPoolId(account, tokenIn, tokenOut);
        const router = this.getRouterContract(account);
        const callData = router.populate(
            'swap',
            {
                pool_id: String(poolId),
                token_from_addr: tokenIn,
                amount_from: bigNumbetToUint256(amountIn),
                amount_to_min: amountOutMin
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
    async getTotalPoolInfo(account){
        const router =this.getRouterContract(account);
        let poolNumber = await router.get_total_number_of_pools();
        poolNumber = Number(poolNumber.num);

        const promises = [];
        for (let i = 1; i <= poolNumber; i++) {
            promises.push(router.get_pool(i.toString()));
        };
        const results = await Promise.all(promises);

        let pools = [];
        for (let i=0; i < results.length; i++) {
            pools.push({
                name:feltToStr(results[i]['pool']['name']),
                pool_id:i+1,
                token_a_address:bigIntToHex(results[i]['pool']['token_a_address']),
                token_a_reserves:uint256ToBigNumber(results[i]['pool']['token_a_reserves']),
                token_b_address:bigIntToHex(results[i]['pool']['token_b_address']),
                token_b_reserves:uint256ToBigNumber(results[i]['pool']['token_b_reserves']),
                fee_percentage:bigIntToBigNumber(results[i]['pool']['fee_percentage']),
                cfmm_type:bigIntToBigNumber(results[i]['pool']['cfmm_type']),
                liq_token:bigIntToHex(results[i]['pool']['liq_token']),
            });
        };
        return pools;
    };
    async getPoolId(account, tokenIn, tokenOut ){
        // 获取pool id (swap和withdrawLiquidity要用)
        const pools = await this.getTotalPoolInfo(account);
        const poolId = pools.filter(item => 
            (BigInt(item.token_a_address) === BigInt(tokenIn) && BigInt(item.token_b_address) === BigInt(tokenOut)) ||
            (BigInt(item.token_a_address) === BigInt(tokenOut) && BigInt(item.token_b_address) === BigInt(tokenIn))
        ).map(item => item.pool_id);
        return poolId[0];
     };

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
        const swapCallData = await this.getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn);
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

module.exports = MySwap;
