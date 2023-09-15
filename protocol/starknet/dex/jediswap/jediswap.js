/**
 * 项目名: dediswap
 * 项目地址：https://app.jediswap.xyz/#/swap
 * 项目文档：https://docs.jediswap.xyz/
 * 已经完成接口： 
 */


const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr } = require('../../../../base/stkUtils.js');

class JediSwap {
    constructor() {
        this.routerAddr = '0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023',
        this.factoryAddr = '0x00dad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd',

        this.routerAbi = require('./abi/router.json'),
        this.factoryAbi = require('./abi/factory.json'),
        this.pairAbi = require('./abi/pair.json')

        this.ETHUSDCLPToken = '0x04d0390b777b424e43839cd1e744799f3de6c176c7e32c1812a41dbd9c19db6a'

        this.zeroUint256 = floatToUint256(0)
    };

    getRouterContract(account, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, account);
    };

    getFactoryContract(account, factoryAddr=this.factoryAddr, factoryAbi=this.factoryAbi){
        return getContract(factoryAddr, factoryAbi, account);
    };

    getPairContract(account, pairAddr, pairAbi=this.pairAbi){
        return getContract(pairAddr, pairAbi, account);
    };
    
    getSwapTokenToTokenCallData(account, path, to, amountIn, amountOutMin = this.zeroUint256) {
        const pathLen = String(path.length);
        const deadline = addSecondsToCurrentTimestamp(360); // 最长360秒
        const router = this.getRouterContract(account);
        const callData = router.populate(
            'swap_exact_tokens_for_tokens',
            {
                amountIn: bigNumbetToUint256(amountIn),
                amountOutMin: amountOutMin,
                path_len: pathLen,
                path: path,
                to: to,
                deadline: deadline.toString()
            } 
        );
        return callData
    };
    getAddLiquidityToPoolCallData(account, tokenA, tokenB, amountA, amountB) {
        const router = this.getRouterContract(account);
        const callData = router.populate(
            'add_liquidity',
            {
                tokenA: tokenA,
                tokenB: tokenB,
                amountADesired: bigNumbetToUint256(amountA),
                amountBDesired: bigNumbetToUint256(amountB),
                amountAMin: multiplyUint256ByFraction(bigNumbetToUint256(amountA), 0.98),
                amountBMin: multiplyUint256ByFraction(bigNumbetToUint256(amountB),0.98),
                to: account.address,
                deadline: addSecondsToCurrentTimestamp(360)
            }
        );
        return callData;
    };
    getRemoveLiquidityCallData(account, tokenA, tokenB, liquidity) {
        const router = this.getRouterContract(account);
        const callData = router.populate(
            'remove_liquidity',
            {
                tokenA: tokenA,
                tokenB: tokenB,
                liquidity: bigNumbetToUint256(liquidity),
                amountAMin: this.zeroUint256,
                amountBMin: this.zeroUint256,
                to: account.address,
                deadline: addSecondsToCurrentTimestamp(360) 
            }
        )
        return callData
    };
    getApproveLPcallData(account, pairAddr, spender, amount) {
        const lpToken = this.getPairContract(account, pairAddr);
        const callData = lpToken.populate(
            'approve',
            {
                spender: spender,
                amount: bigNumbetToUint256(amount),
            }
        );
        return callData;
    };
    async getPairAddr(account, tokenA, tokenB ){
        const factory = this.getFactoryContract(account);
        const pair = await factory.get_pair(String(BigInt(tokenA)), String(BigInt(tokenB)));
        return bigIntToHex(pair.pair);
     };

    async getLPBalance(account, pairAddr) {
        // 获取LP余额，返回bigNumber类型的数据
        const lpToken = this.getPairContract(account, pairAddr)
        let balance = await lpToken.balanceOf(account.address);
        return uint256ToBigNumber(balance.balance);
    };
    async getToken0andToek1Addr(account, pairAddr){
        // 获取Pair中两个Token的位置
        const pair = this.getPairContract(account, pairAddr);
        let token0Addr = await pair.token0();
        let token1Addr = await pair.token1();
        return{
            token0: bigIntToHex(token0Addr.address),
            token1: bigIntToHex(token1Addr.address)
        };
    };
    async getReserves(account, pairAddr){
        /**
         * 获取pair中2个资产储备量
         */
        const pair = this.getPairContract(account, pairAddr);
        let Reserves = await pair.get_reserves();
        return {
            reserve0: uint256ToBigNumber(Reserves.reserve0),
            reserve1: uint256ToBigNumber(Reserves.reserve1)
        }
    };
    async getPairInfo(account, tokenA, tokenB){
        const pairAddr = await this.getPairAddr(account, tokenA, tokenB);
        const pairAddrInfo = await this.getToken0andToek1Addr(account, pairAddr);
        const pairReserves = await this.getReserves(account, pairAddr);
        return {...pairAddrInfo, ...pairReserves};
    };
    async getQuote(account, tokenA, tokenB, amountA){
        /**
         * 获取报价，用于LP计算;
         * amountA: tokenA的数量
         * reserveA: tokenA在Pool中的储备数量
         * reserveB: tokenB在Pool中的储备数量
         */ 
        const pairInfo = await this.getPairInfo(account, tokenA, tokenB);       
        const router = this.getRouterContract(account);
        const reserveA = tokenA === pairInfo.token0 ? pairInfo.reserve0 : pairInfo.reserve1;
        const reserveB = tokenA === pairInfo.token0 ? pairInfo.reserve1 : pairInfo.reserve0;
        const amountB = await router.quote(
            bigNumbetToUint256(amountA), 
            bigNumbetToUint256(reserveA),
            bigNumbetToUint256(reserveB)
            );
        return uint256ToBigNumber(amountB.amountB);
    };
    async swapTokenToToken(account, tokenIn, tokenOut, amountIn) {
        const approveCallData = getApproveCallData(tokenIn, this.routerAddr, amountIn);
        const swapCallData = this.getSwapTokenToTokenCallData(account, [tokenIn, tokenOut], account.address, amountIn);
        const multiCallData = [approveCallData, swapCallData];
        return await multiCallContract(account, multiCallData);
    };

    async addLiquidityToPool(account, tokenA, tokenB, amountA, amountB) {
        const tokenAApproveCallData = getApproveCallData(tokenA, this.routerAddr, amountA);
        const tokenBApproveCallData = getApproveCallData(tokenB, this.routerAddr, amountB);
        const addLiquidityCallData = this.getAddLiquidityToPoolCallData(account, tokenA, tokenB, amountA, amountB);
        const multiCallData = [tokenAApproveCallData, tokenBApproveCallData, addLiquidityCallData];
        return await multiCallContract(account, multiCallData)
     };

    async removeLiquidityForPool(account, tokenA, tokenB) {
        const pairAddr = await this.getPairAddr(account, tokenA, tokenB);
        const lpBalance = await this.getLPBalance(account, pairAddr);
        const approveLPCallData = this.getApproveLPcallData(account, pairAddr, this.routerAddr, lpBalance);
        const removeLiquidityCallData = this.getRemoveLiquidityCallData(account, tokenA, tokenB, lpBalance);
        const multiCallData = [approveLPCallData, removeLiquidityCallData];
        return await multiCallContract(account, multiCallData);
     };

};

module.exports = JediSwap;