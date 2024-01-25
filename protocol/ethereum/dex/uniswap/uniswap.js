
/**
 * 项目名称：UniSwap
 * 项目链接：https://uniswap.org/
 * 项目文档：https://docs.uniswap.org/
 * GitHub：https://github.com/Uniswap
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth, mintLiquidityPosition, increaseLiquidity, decreaseLiquidity
 * 支持：Mainnet, Goerli, Arbitrum, Optimism, Polygon等链，其他链需要根据链调整合约地址，合约地址链接：https://docs.uniswap.org/contracts/v3/reference/deployments
 * 
 */
const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed } = require('../../../../base/utils');
const { tokenApprove } = require('../../../../base/coin/token');

class UniSwap {
    constructor() {
        this.name = 'uniswap';
        this.v3PoolFactoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
        this.quoterV2Address = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
        this.v3SwapRouterAddress = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
        this.nonfungiblePositionManagerAddress = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';


        this.v3PoolFactoryABI = require('./abi/v3PoolFactory.json');
        this.v3PoolABI = require('./abi/v3Pool.json');
        this.quoterV2ABI = require('./abi/quoterV2.json');
        this.v3SwapRouterABI = require('./abi/v3SwapRouter.json');
        this.nonfungiblePositionManagerABI = require('./abi/nonfungiblePositionManager.json');
    };

    getV3FactoryContract(wallet) {
        return getContract(this.v3PoolFactoryAddress, this.v3PoolFactoryABI, wallet);
    };

    getPoolContract(wallet, poolAddress) {
        return getContract(poolAddress, this.v3PoolABI, wallet);
    };

    getQuoteContract(wallet) {
        return getContract(this.quoterV2Address, this.quoterV2ABI, wallet);
    };

    getSwapRouterV3Contract(wallet) {
        return getContract(this.v3SwapRouterAddress, this.v3SwapRouterABI, wallet);
    };

    getNonfungiblePositionManagerContract(wallet) {
        return getContract(this.nonfungiblePositionManagerAddress, this.nonfungiblePositionManagerABI, wallet)
    };

    async getWETH9Address(wallet) {
        const router = this.getSwapRouterV3Contract(wallet);
        return await router.WETH9();
    }

    async getPoolInfo(wallet, tokenA, tokenB, poolFee) {
        const factory = this.getV3FactoryContract(wallet);
        const poolAddress = await factory.getPool(tokenA, tokenB, poolFee);
        const poolContract = this.getPoolContract(wallet, poolAddress);
        const [token0, token1, fee, tickSpacing, liquidity, slot0] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ]);
        return {
            pool: poolAddress,
            token0,
            token1,
            fee,
            tickSpacing,
            liquidity,
            sqrtPriceX96: slot0[0],
            tick: slot0[1],
        };
    };

    async getQuote(wallet, tokenIn, tokenOut, poolFee, amount) {
        const quoterContract = this.getQuoteContract(wallet);
        const params = {
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amount,
            fee: poolFee,
            sqrtPriceLimitX96: 0 // 这是一个示例值，您可能需要为它提供适当的值
        };
        const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(params);
        return quotedAmountOut;
    };

    async getLPPositionInfo(wallet, id) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const positionInfo = await nonfungiblePositionManager.positions(id);
        return positionInfo;
    };

    async getLPPositionIds(wallet) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const balance = Number(await nonfungiblePositionManager.balanceOf(wallet.address));
        return await Promise.all(Array.from({ length: balance }, async (_, i) => {
            return Number(await nonfungiblePositionManager.tokenOfOwnerByIndex(wallet.address, i));
        }));
    };

    getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, recipient) {
        const router = this.getSwapRouterV3Contract(wallet);
        return router.interface.encodeFunctionData('exactInputSingle', [
            [
                tokenIn,  // 支付代币
                tokenOut,  // 获得代币
                fee,  // 手续费比例
                recipient,  // 接收地址
                amountIn,  // 支付数量
                0,  // 最小返回数量
                0
            ]
        ]);

    };

    getMintLiquidityPositionCallData(wallet, token0, token1, poolFee, amount0, amount1, tickLower, tickUpper) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        return nonfungiblePositionManager.interface.encodeFunctionData('mint', [
            [
                token0,
                token1,
                poolFee,
                tickLower,
                tickUpper,
                amount0,
                amount1,
                0,
                0,
                wallet.address,
                Math.floor(Date.now() / 1000) + 60 * 20
            ]
        ]);
    };

    getIncreaseLiquidityCallData(wallet, tokenId, amount0Desired, amount1Desired) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        return nonfungiblePositionManager.interface.encodeFunctionData('increaseLiquidity', [
            [
                tokenId,
                amount0Desired,
                amount1Desired,
                0,
                0,
                Math.floor(Date.now() / 1000) + 60 * 20
            ]
        ]);
    };

    getDecreaseLiquidityCallData(wallet, tokenId, liquidity) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        return nonfungiblePositionManager.interface.encodeFunctionData('decreaseLiquidity', [
            [
                tokenId,
                liquidity,
                0,
                0,
                Math.floor(Date.now() / 1000) + 60 * 20
            ]
        ])
    };

    getCollectCallData(wallet, tokenId, recipient) {
        const maxUint128 = ethers.BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        return nonfungiblePositionManager.interface.encodeFunctionData('collect', [
            [
                tokenId,
                recipient,
                maxUint128,
                maxUint128
            ]
        ]);
    };

    getSweepTokenCallData(wallet, token) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        return nonfungiblePositionManager.interface.encodeFunctionData('sweepToken', [
            token,
            0,
            wallet.address
        ]);


    };

    async swapEthToToken(wallet, tokenIn, tokenOut, fee, amountIn) {
        const router = this.getSwapRouterV3Contract(wallet);

        const swapCallData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, wallet.address);
        console.log(swapCallData);
        // 预估交易费用
        const gasEstimate = await router.estimateGas.multicall([swapCallData], { value: amountIn });
        const gasPrice = await wallet.provider.getGasPrice();
        const response = await router.multicall([swapCallData], { value: amountIn, gasPrice: gasPrice, gasLimit: gasEstimate });
        return await response.wait();
    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, fee, amountIn) {
        const router = this.getSwapRouterV3Contract(wallet)
        const swapCallData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, wallet.address)
        // 预估交易费用
        const gasEstimate = await router.estimateGas.multicall([swapCallData]);
        const gasPrice = await wallet.provider.getGasPrice();
        const response = await router.multicall([swapCallData], { gasPrice: gasPrice, gasLimit: gasEstimate })
        return await response.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, fee, amountIn) {
        const router = this.getSwapRouterV3Contract(wallet)
        const swapCallData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, '0x0000000000000000000000000000000000000000')
        const unwrapCallData = router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
        // 预估交易费用
        const gasEstimate = await router.estimateGas.multicall([swapCallData, unwrapCallData]);
        const gasPrice = await wallet.provider.getGasPrice();
        const response = await router.multicall([swapCallData, unwrapCallData], { gasPrice: gasPrice, gasLimit: gasEstimate })
        return await response.wait();
    };

    async mintLiquidityPosition(wallet, token0, token1, poolFee, amount0, amount1, tickLower, tickUpper) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const callData = this.getMintLiquidityPositionCallData(wallet, token0, token1, poolFee, amount0, amount1, tickLower, tickUpper);
        const response = await nonfungiblePositionManager.multicall([callData])
        return await response.wait();
    };

    async mintETHLiquidityPosition(wallet, token0, token1, poolFee, amount0, amount1, tickLower, tickUpper) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const callData = this.getMintLiquidityPositionCallData(wallet, token0, token1, poolFee, amount0, amount1, tickLower, tickUpper);
        const response = await nonfungiblePositionManager.multicall([callData], { value: amount1 })
        return await response.wait();
    };

    async increaseLiquidity(wallet, tokenId, amount0Desired, amount1Desired) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const callData = this.getIncreaseLiquidityCallData(wallet, tokenId, amount0Desired, amount1Desired);
        const response = await nonfungiblePositionManager.multicall([callData])
        return await response.wait();

    };

    async increaseLiquidityToETHPool(wallet, tokenId, amount0Desired, amount1Desired, amountETH) {
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const callData = this.getIncreaseLiquidityCallData(wallet, tokenId, amount0Desired, amount1Desired);
        const response = await nonfungiblePositionManager.multicall([callData], { value: amountETH })
        return await response.wait();

    };

    async decreaseLiquidity(wallet, tokenId, decreasePCT) {
        const positionInfo = await this.getLPPositionInfo(wallet, tokenId);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const callData = this.getDecreaseLiquidityCallData(wallet, tokenId, liquidityAmount);
        const collectCallData = this.getCollectCallData(wallet, tokenId, wallet.address);
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const response = await nonfungiblePositionManager.multicall([callData, collectCallData])
        return await response.wait();
    };

    async decreaseETHLiquidity(wallet, tokenId, decreasePCT = 1) {
        const positionInfo = await this.getLPPositionInfo(wallet, tokenId);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const callData = this.getDecreaseLiquidityCallData(wallet, tokenId, liquidityAmount);
        const collectCallData = this.getCollectCallData(wallet, tokenId, '0x0000000000000000000000000000000000000000');
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const unwrapCallData = nonfungiblePositionManager.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
        const response = await nonfungiblePositionManager.multicall([callData, collectCallData, unwrapCallData])
        return await response.wait();
    };

    async decreaseETHAndTokenLiquidity(wallet, tokenId, decreasePCT) {
        const positionInfo = await this.getLPPositionInfo(wallet, tokenId);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const callData = this.getDecreaseLiquidityCallData(wallet, tokenId, liquidityAmount);
        const collectCallData = this.getCollectCallData(wallet, tokenId, '0x0000000000000000000000000000000000000000');
        const nonfungiblePositionManager = this.getNonfungiblePositionManagerContract(wallet);
        const unwrapCallData = nonfungiblePositionManager.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
        const wETHAddress = await this.getWETH9Address(wallet);
        const token = (positionInfo.token0 === wETHAddress) ? positionInfo.token1 : positionInfo.token0;
        const sweepTokenCallData = this.getSweepTokenCallData(wallet, token);
        const response = await nonfungiblePositionManager.multicall([callData, collectCallData, unwrapCallData, sweepTokenCallData])
        return await response.wait();
    };

}

module.exports = UniSwap;



