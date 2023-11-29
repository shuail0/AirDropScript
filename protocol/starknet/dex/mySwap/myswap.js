/**
 * 项目名: mySwap
 * 项目地址：https://www.myswap.xyz/
 * 项目文档：
 * 已经完成接口： swap
 */

const { uint256 } = require('starknet');
const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');
const { warn } = require('winston');

class MySwap {
    constructor(){
        this.routerAddr = '0x010884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28',
        this.CLPostionNFTAddr = '0x00fff107e2403123c7df78d91728a7ee5cfd557aec0fa2d2bdc5891c286bbfff',
        this.CLAMMSwapAddr = '0x01114c7103e12c2b2ecbd3a2472ba9c48ddcbf702b1c242dd570057e26212111',

        this.routerAbi = require('./abi/router.json');
        this.CLAMMSwapAbi = require('./abi/CLammswap.json');
        this.positionNftAbi = require('./abi/positionNFT.json');
        this.zeroUint256 = floatToUint256(0);
    };


    getRouterContract(account, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, account);
    };
    getCLAMMSwapContract(account){
        return getContract(this.CLAMMSwapAddr,this.CLAMMSwapAbi, account)
    };
    getCLPositionContract(account) {
        return getContract(this.CLPostionNFTAddr, this.positionNftAbi, account);
    };
    async getCLPoolInfo(account, token0, token1, fee) {
        const AMMSwapContract = this.getCLAMMSwapContract(account);
        const poolKey = await AMMSwapContract.get_pool(token0, token1, fee);
        const [poolParams, tick, sqrtPrice] = await Promise.all([
            AMMSwapContract.pool_params(poolKey),
            AMMSwapContract.current_tick(poolKey),
            AMMSwapContract.current_sqrt_price(poolKey)
        ])
        return {
            poolKey: bigIntToHex(poolKey),
            token0:bigIntToHex(poolParams.token0),
            token1:bigIntToHex(poolParams.token1),
            fee: Number(poolParams.fee),
            tickSpacing: Number(poolParams.tick_spacing),
            tick: Number(tick),
            sqrtPrice:Number(sqrtPrice)
        }
    };

    async getLPPositionIds(account) {
        const CLPositionContract = this.getCLPositionContract(account);
        const balance = Number(await CLPositionContract.balance_of(account.address));
        return await Promise.all(Array.from({ length: balance }, async (_, i) => {
            return Number(await CLPositionContract.tokenOfOwnerByIndex(account.address, i));
        }));
    };

    async getLPPositionInfo(account, id){
        const CLPositionContract = this.getCLPositionContract(account);
        const positionInfo = await CLPositionContract.positions(id);
        return {
            token0: bigIntToHex(positionInfo.token0),
            token1: bigIntToHex(positionInfo.token1),
            fee: Number(positionInfo.token1),
            tickLower: Number(positionInfo.tick_lower),
            tickUpper: Number(positionInfo.tick_upper),
            liquidity: Number(positionInfo.liquidity),
            feeGrowthInside0LastX128: Number(positionInfo.fee_growth_inside0_last_x128),
            feeGrowthInside1LastX128: Number(positionInfo.fee_growth_inside1_last_x128),
            tokensOwed0: Number(positionInfo.tokens_owed0),
            tokensOwed1: Number(positionInfo.tokens_owed1)
        };
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
        return callData;
    };
    getMintLiquidityPositionCallData(account, token0, token1, fee, tick_lower, tick_upper, amount0_desired, amount1_desired){

        const CLPositionContract = this.getCLPositionContract(account);
        const callData = CLPositionContract.populate(
            'mint',
            [
                {
                    recipient: account.address,
                    token0,
                    token1,
                    fee,
                    tick_lower,
                    tick_upper,
                    amount0_desired: bigNumbetToUint256(amount0_desired),
                    amount1_desired: bigNumbetToUint256(amount1_desired),
                    amount0_min:0,
                    amount1_min:0
                }
            ]
        );
        return callData;

    };
    getIncreaseLiquidityCallData(account, tokenId, amount0, amount1){
        const CLPositionContract = this.getCLPositionContract(account);
        const callData = CLPositionContract.populate(
            'increase_liquidity',
            [
                {
                    token_id: tokenId,
                    amount0_desired: bigNumbetToUint256(amount0),
                    amount1_desired: bigNumbetToUint256(amount1),
                    amount0_min: 0,
                    amount1_min: 0
                }
            ]
        );
        return callData;
    };
    getDecreaseLiquidityCallData(account, tokenId, liquidityAmount){
        const CLPositionContract = this.getCLPositionContract(account);
        const callData = CLPositionContract.populate(
            'decrease_liquidity',
            [
                {
                    token_id: tokenId,
                    liquidity: liquidityAmount,
                    amount0_min: 0,
                    amount1_min: 0
                }
            ]
        );
        return callData;
    };

    getCollectCallData(account, tokenId){
        const CLPositionContract = this.getCLPositionContract(account);
        const callData = CLPositionContract.populate(
            'collect',
            [
                {
                    token_id: tokenId,
                    recipient: account.address,
                    amount0_max: '340282366920938463463374607431768211455',
                    amount1_max: '340282366920938463463374607431768211455'
                }
            ]
        )
        return callData;

    };

    getBurnPositionCallData(account, tokenId){
        const CLPositionContract = this.getCLPositionContract(account);
        const callData = CLPositionContract.populate(
            'burn',
            {
                token_id: tokenId
            }
        )
        return callData;
    };



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


    async swapTokenToToken(account, tokenIn, tokenOut, amountIn) {
        const approveCallData = getApproveCallData(tokenIn, this.routerAddr, amountIn);
        const swapCallData = await this.getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn);
        const multiCallData = [approveCallData, swapCallData];
        return await multiCallContract(account, multiCallData);
    };

    async mintCLLiquidityPosition(account, token0, token1, fee, tickLower, tickUpper, amount0, amount1){
        let multiCallData = [];
        if (Number(amount0) > 0) {
            const token0approveCallData = getApproveCallData(token0, this.CLPostionNFTAddr, amount0);
            multiCallData.push(token0approveCallData)
        }
        if (Number(amount1) > 0) {
            const token1approveCallData = getApproveCallData(token1, this.CLPostionNFTAddr, amount1);
            multiCallData.push(token1approveCallData)
        }
        const mintCallData = this.getMintLiquidityPositionCallData(account, token0, token1, fee, tickLower, tickUpper,amount0, amount1);
        multiCallData.push(mintCallData)
        return await multiCallContract(account, multiCallData);
    };

    async increaseCLLiquidity(account, tokenId, token0, token1, amount0, amount1){
        let multiCallData = [];
        if (Number(amount0) > 0) {

            const token0approveCallData = getApproveCallData(token0, this.CLPostionNFTAddr, amount0);
            multiCallData.push(token0approveCallData)
        }
        if (Number(amount1) > 0) {
            const token1approveCallData = getApproveCallData(token1, this.CLPostionNFTAddr, amount1);
            multiCallData.push(token1approveCallData)
        }

        const increaseLiquidityCallData = this.getIncreaseLiquidityCallData(account, tokenId, amount0, amount1);
        multiCallData.push(increaseLiquidityCallData);
        return await multiCallContract(account, multiCallData);

    }

    async decreaseCLLiquidity(account, tokenId, decreasePCT){
        const positionInfo = await this.getLPPositionInfo(account, tokenId);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const decreaseLiquidityCallData = this.getDecreaseLiquidityCallData(account, tokenId, liquidityAmount);
        const collectCallData = this.getCollectCallData(account, tokenId);
        const multiCallData = [decreaseLiquidityCallData, collectCallData];
        return await multiCallContract(account, multiCallData);
    }

    async decreaseCLLiquidityAndBurnPosition(account, tokenId){
        const positionInfo = await this.getLPPositionInfo(account, tokenId);
        const decreaseLiquidityCallData = this.getDecreaseLiquidityCallData(account, tokenId, positionInfo.liquidity);
        const collectCallData = this.getCollectCallData(account, tokenId);
        const burnCallData = this.getBurnPositionCallData(account, tokenId);
        const multiCallData = [decreaseLiquidityCallData, collectCallData, burnCallData];
        return await multiCallContract(account, multiCallData);
    }



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
