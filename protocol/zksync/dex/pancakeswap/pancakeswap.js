const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed } = require('../../../../base/utils');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');

class PancakeSwap {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';

        this.v3PoolFactoryAddress = '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB';
        this.quoterV2Address = '0x3d146FcE6c1006857750cBe8aF44f76a28041CCc';
        this.v3SwapRouterAddress = '0xD70C70AD87aa8D45b8D59600342FB3AEe76E3c68';
        this.nonfungiblePositionManagerAddress = '0xa815e2eD7f7d5B0c49fda367F249232a1B9D2883';


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

    async getLPPositionInfo(wallet, id){
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
                Math.floor(Date.now() / 1000) + 60 * 20,  // 交易截止时间
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

    getCollectCallData(wallet, tokenId, recipient){
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
        const response = await router.multicall([swapCallData], { value: amountIn });
        return await response.wait();
    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, fee, amountIn) {
        const router = this.getSwapRouterV3Contract(wallet)
        const swapCallData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, wallet.address)
        const response = await router.multicall([swapCallData])
        return await response.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, fee, amountIn) {
        const router = this.getSwapRouterV3Contract(wallet)
        const swapCallData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, fee, amountIn, '0x0000000000000000000000000000000000000000')
        const unwrapCallData = router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
        const response = await router.multicall([swapCallData, unwrapCallData])
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
        const response = await nonfungiblePositionManager.multicall([callData], {value: amount1})
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
        const response = await nonfungiblePositionManager.multicall([callData], {value: amountETH})
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

    async decreaseETHLiquidity(wallet, tokenId, decreasePCT=1) {
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
        const token = (positionInfo.token0 === this.wETHAddress) ? positionInfo.token1 : positionInfo.token0;
        const sweepTokenCallData = this.getSweepTokenCallData(wallet,token);
        const response = await nonfungiblePositionManager.multicall([callData, collectCallData, unwrapCallData, sweepTokenCallData])
        return await response.wait(); 
    };

}

module.exports = PancakeSwap;

// const zskrpc = "https://mainnet.era.zksync.io"
// const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
// const provider = new Provider(zskrpc);
// const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
// const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';

// const wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
// const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
// const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
// const poolFee = 500;
// const amount = floatToFixed(1, 6)
// const amountA = floatToFixed(0.001, 18)
// const amountB = floatToFixed(1, 6)

// console.log(Number(amountA)*0.2)


// const walletData = convertCSVToObjectSync(walletPath);
// const wallet = new Wallet(walletData[0]['PrivateKey'], provider, ethereumProvider);
// const pancake = new PancakeSwap()


// pancake.getPoolInfo(wallet, wETHAddress, usdcAddress, poolFee).then(console.log)
// pancake.getQuote(wallet, usdcAddress, wETHAddress, poolFee, amount).then(console.log)

// pancake.swapEthToToken(wallet, wETHAddress, usdcAddress, poolFee, amount).then(console.log)
// tokenApprove(wallet, usdcAddress, pancake.v3SwapRouterAddress, amount);
// pancake.swapTokenToEth(wallet, usdcAddress, wETHAddress, poolFee, amount).then(console.log);
// tokenApprove(wallet, usdcAddress, pancake.nonfungiblePositionManagerAddress, amountB);
// pancake.mintLiquidityPosition(wallet, wETHAddress, usdcAddress, poolFee, amountA, amountB, -0.5, -0.4).then(console.log)
// pancake.getLPPositionIds(wallet).then(console.log)
// pancake.getLPPositionInfo(wallet, '122011').then(console.log)
// pancake.decreaseETHLiquidity(wallet, '120188', 0.5).then(console.log);
// pancake.decreaseETHAndTokenLiquidity(wallet, '122011', 1).then(console.log);


