const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed } = require('../../../../base/utils');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');

class Izumi {
    constructor() {
        this.wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';

        this.factoryAddress = '0x7FD55801c066AeB0bD848c2BA8AEc821AF700A41'
        this.swapX2YModuleAddress = '0x19ed8bB72F93B87A0605fAcc116019039757e95A'
        this.swapY2XModuleAddress = '0x4A7Df45560899606f1fa5aE7475816ecBbf66A68'
        this.liquidityModuleAddress = '0x38D526f278189Cb6983Cf8bc58BBFAea7D2c3B22'
        this.limitOrderModuleAddress = '0x47798d598891708ceD5Bd425b9bf3C56AfA473F0'
        this.flashModuleAddress = '0x1a3CC65Fe937C7dDd110cB65b281D7075766CA02'
        this.quoterWithoutLimitAddress = '0xE93D1d35a63f7C6b51ef46a27434375761a7Db28'
        this.quoterWithin10000TicksAddress = '0xA8101060508f3A7fB9a98425a7fb765DB14ae224'
        this.swapAddress = '0x3040EE148D09e5B92956a64CDC78b49f48C0cDdc'


        this.liquidityManagerAddress = '0x483FDE31bcE3DCc168E23a870831b50Ce2cCd1F1'
        this.limitOrderManagerAddress = '0x430972C4AF4703F7ce7B95C03735ae1504dD0Dd6'
        // this.BoxAddress = ''

        // this.factoryABI = '0x7FD55801c066AeB0bD848c2BA8AEc821AF700A41'
        // this.swapX2YModuleABI = '0x19ed8bB72F93B87A0605fAcc116019039757e95A'
        // this.swapY2XModuleABI = '0x4A7Df45560899606f1fa5aE7475816ecBbf66A68'
        // this.liquidityModuleABI = '0x38D526f278189Cb6983Cf8bc58BBFAea7D2c3B22'
        // this.limitOrderModuleABI = '0x47798d598891708ceD5Bd425b9bf3C56AfA473F0'
        // this.flashModuleABI = '0x1a3CC65Fe937C7dDd110cB65b281D7075766CA02'
        // this.quoterWithoutLimitABI = '0xE93D1d35a63f7C6b51ef46a27434375761a7Db28'
        // this.quoterWithin10000TicksABI = '0xA8101060508f3A7fB9a98425a7fb765DB14ae224'
        // this.swapABI = '0x3040EE148D09e5B92956a64CDC78b49f48C0cDdc'
        this.liquidityManagerABI = require('./abi/liquidityManage.json');
        // this.limitOrderManagerABI = '0x430972C4AF4703F7ce7B95C03735ae1504dD0Dd6'
        this.poolAbi = require('./abi/poolAbi.json');
    };

    getV3FactoryContract(wallet) {
        return getContract(this.v3PoolFactoryAddress, this.v3PoolFactoryABI, wallet);
    };

    getPoolContract(wallet, poolAddress) {
        return getContract(poolAddress, this.poolAbi, wallet);
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

    getLiquidityManagerContract(wallet){
        return getContract(this.liquidityManagerAddress, this.liquidityManagerABI, wallet);
    };

    async getPoolInfo(wallet, tokenA, tokenB, poolFee) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const poolAddress = await liquidityManagerContract.pool(tokenA, tokenB, poolFee);
        const poolContract = this.getPoolContract(wallet, poolAddress);
        const {
            sqrtPrice_96, currentPoint, observationCurrentIndex, observationQueueLen, observationNextQueueLen, liquidity, liquidityX
        } = await poolContract.state()
        const [tokenX, tokenY, pointDelta] = await Promise.all([
            poolContract.tokenX(),
            poolContract.tokenY(),
            poolContract.pointDelta()
        ]);
        return {
            pool: poolAddress,  // pool地址
            tokenX,  // tokenX地址
            tokenY,  // tokenY地址
            sqrtPrice_96: sqrtPrice_96.toString(),  // 价格平方
            pointDelta: pointDelta,  // tick间距
            currentPoint: Number(currentPoint),  // 当前tick
            observationCurrentIndex: Number(observationCurrentIndex),
            observationQueueLen: Number(observationQueueLen),
            observationNextQueueLen: Number(observationNextQueueLen),
            liquidity: liquidity.toString(),
            liquidityX: liquidityX.toString()
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
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const positionInfo = await liquidityManagerContract.liquidities(id);
        return {
            tokenId: id,
            leftPoint: Number(positionInfo.leftPt),
            rightPoint: Number(positionInfo.rightPt),
            liquidity: positionInfo.liquidity.toString(),
            lastFeeScaleX_128: positionInfo.lastFeeScaleX_128.toString(),
            lastFeeScaleY_128: positionInfo.lastFeeScaleY_128.toString(),
            remainTokenX: positionInfo.remainTokenX.toString(),
            remainTokenY: positionInfo.remainTokenY.toString(),
            poolId: positionInfo.poolId.toString()
        };
    };

    async getLPPositionIds(wallet) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const balance = Number(await liquidityManagerContract.balanceOf(wallet.address));
        return await Promise.all(Array.from({ length: balance }, async (_, i) => {
            return Number(await liquidityManagerContract.tokenOfOwnerByIndex(wallet.address, i));
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

    getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, leftPoint, rightPoint) {

        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);

        return liquidityManagerContract.interface.encodeFunctionData('mint',[
            {
                miner: wallet.address,  // 接收地址
                tokenX: tokenX,  // token地址
                tokenY: tokenY,  // token地址
                fee: poolFee,  // 手续费
                pl: leftPoint,  // 左边tick
                pr: rightPoint,  // 右边tick
                xLim: amountX, // x数量
                yLim: amountY, // y数量
                amountXMin: 0,  // 最小存入x数量
                amountYMin: 0,  // 最小存入y数量
                deadline: Math.floor(Date.now() / 1000) + 60 * 20
            }       
        ]);
    };

    getIncreaseLiquidityCallData(wallet, tokenId, amountXDesired, amountYDesired) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        return liquidityManagerContract.interface.encodeFunctionData('addLiquidity', [
            [
                tokenId,
                amountXDesired,
                amountYDesired,
                0,
                0,
                Math.floor(Date.now() / 1000) + 60 * 20
            ]
        ]);
    };

    getDecreaseLiquidityCallData(wallet, tokenId, liquidity) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        return liquidityManagerContract.interface.encodeFunctionData('decLiquidity', [
            tokenId,
            liquidity,
            0,
            0,
            Math.floor(Date.now() / 1000) + 60 * 20

        ])
    };

    getCollectCallData(wallet, tokenId, recipient){
        const maxUint128 = ethers.BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        return liquidityManagerContract.interface.encodeFunctionData('collect', [
            recipient,
            tokenId,
            maxUint128,
            maxUint128
        ]);
    };

    getUnwrapWETH9Calldata(wallet) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        return liquidityManagerContract.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
    }
    
    getSweepTokenCallData(wallet, token) {
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        return liquidityManagerContract.interface.encodeFunctionData('sweepToken', [
            token,
            0,
            wallet.address
        ]);

    };

    async swapEthToToken(wallet, tokenIn, tokenOut, fee, amountIn) {

    };

    async swapTokenToToken(wallet, tokenIn, tokenOut, fee, amountIn) {

    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, fee, amountIn) {

    };

    async mintLiquidityPosition(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper) {
        const callData = this.getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper);
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const response = await liquidityManagerContract.multicall([callData])
        return await response.wait();

    };

    async mintETHLiquidityPosition(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUppe) {
        const callData = this.getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper);
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const response = await liquidityManagerContract.multicall([callData], {value: amountY})
        return await response.wait();
    };

    async increaseLiquidity(wallet, tokenId, amount0Desired, amount1Desired) {


    };

    async increaseLiquidityToETHPool(wallet, tokenId, amountXDesired, amountYDesired, amountETH) {

        const callData = this.getIncreaseLiquidityCallData(wallet, tokenId, amountXDesired, amountYDesired);
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const response = await liquidityManagerContract.multicall([callData], {value: amountETH})
        return await response.wait();
    };

    async decreaseLiquidity(wallet, tokenId, decreasePCT) {

    };

    async decreaseETHLiquidity(wallet, tokenId, decreasePCT=1, sweepToken='') {
        const positionInfo = await this.getLPPositionInfo(wallet, tokenId);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const callData = this.getDecreaseLiquidityCallData(wallet, tokenId, liquidityAmount);
        const collectCallData = this.getCollectCallData(wallet, tokenId, this.liquidityManagerAddress );
        const unwrapCallData = this.getUnwrapWETH9Calldata(wallet);
        const token = (positionInfo.tokenX === this.wETHAddress) ? positionInfo.tokenY : positionInfo.tokenX;
        const sweepTokenCallData = this.getSweepTokenCallData(wallet,usdcAddress);
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const response = await liquidityManagerContract.multicall([callData, collectCallData, unwrapCallData, sweepTokenCallData])
        return await response.wait();

    };

    async decreaseETHAndTokenLiquidity(wallet, tokenId, decreasePCT) {

    };

}

module.exports = Izumi;

const zskrpc = "https://mainnet.era.zksync.io"
const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
const provider = new Provider(zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';

const wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
const poolFee = 2000;
const amount = floatToFixed(100, 6)
const amountA = floatToFixed(0.001, 18)
const amountB = floatToFixed(0, 6)



const walletData = convertCSVToObjectSync(walletPath);
const wallet = new Wallet(walletData[0]['PrivateKey'], provider, ethereumProvider);
const izumi = new Izumi()


// izumi.getPoolInfo(wallet, wETHAddress, usdcAddress, poolFee).then(console.log)
// pancake.getQuote(wallet, usdcAddress, wETHAddress, poolFee, amount).then(console.log)

// pancake.swapEthToToken(wallet, wETHAddress, usdcAddress, poolFee, amount).then(console.log)
// tokenApprove(wallet, usdcAddress, pancake.v3SwapRouterAddress, amount);
// pancake.swapTokenToEth(wallet, usdcAddress, wETHAddress, poolFee, amount).then(console.log);


// tokenApprove(wallet, usdcAddress, izumi.liquidityManagerAddress, amount);
// izumi.mintLiquidityPosition(wallet, usdcAddress, wETHAddress, poolFee, amountB, amountA, 202200, 202240).then(console.log)


// izumi.getLPPositionIds(wallet).then(console.log)
// izumi.getLPPositionInfo(wallet, 187494).then(console.log)
// izumi.decreaseETHLiquidity(wallet, 187494, 0.5, usdcAddress).then(console.log);

izumi.increaseLiquidityToETHPool(wallet, 187494, amountB, amountA, amountA).then(console.log);
// izumi.decreaseETHAndTokenLiquidity(wallet, '122011', 1).then(console.log);


