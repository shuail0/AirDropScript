const path = require('path');
const ethers = require('ethers');
const { getContract, floatToFixed, convertCSVToObjectSync } = require('../../../../base/utils');
const { FeeAmount } = require('@uniswap/v3-sdk');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');

class Mavrick {
    constructor() {
        this.routerAddr = '0x39E098A153Ad69834a9Dac32f0FCa92066aD03f4';
        this.factoryAddr = '0x2C1a605f843A2E18b7d7772f0Ce23c236acCF7f5';
        this.positionAddr = '0xFd54762D435A490405DDa0fBc92b7168934e8525';
        this.positionInspectorAddr = '0x852639EE9dd090d30271832332501e87D287106C';

        this.routerAbi = require('./abi/MaverickIRouter.json');
        this.factoryAbi = require('./abi/MaverickIFactory.json');
        this.poolAbi = require('./abi/MaverickIPool.json');
        this.positionAbi = require('./abi/MaverickIPosition.json');
        this.positionInspectorAbi = require('./abi/MaverickIPositionInspector.json');
    };

    getRouter(wallet, routerAddr = this.routerAddr, routerAbi = this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    getFactory(wallet) {
        return getContract(this.factoryAddr, this.factoryAbi, wallet);
    };

    getPoolContract(wallet, poolAddress) {
        return getContract(poolAddress, this.poolAbi, wallet);
    };

    getPositionContract(wallet) {
        return getContract(this.positionAddr, this.positionAbi, wallet);
    };

    getPositionInspectorContract(wallet) {
        return getContract(this.positionInspectorAddr, this.positionInspectorAbi, wallet);
    };


    getExactInputSingleCallData(wallet, tokenIn, tokenOut, amount, pool, min) {
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData('exactInputSingle', [
            [
                tokenIn,
                tokenOut,
                pool,
                wallet.address,
                1e13,
                amount,
                min,
                floatToFixed(0)
            ]
        ]);
    };

    // getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, leftPoint, rightPoint) {

    //     const router = this.getRouter(wallet);

    //     return router.interface.encodeFunctionData('mint',[
    //         {
    //             miner: wallet.address,  // 接收地址
    //             tokenX: tokenX,  // token地址
    //             tokenY: tokenY,  // token地址
    //             fee: poolFee,  // 手续费
    //             pl: leftPoint,  // 左边tick
    //             pr: rightPoint,  // 右边tick
    //             xLim: amountX, // x数量
    //             yLim: amountY, // y数量
    //             amountXMin: 0,  // 最小存入x数量
    //             amountYMin: 0,  // 最小存入y数量
    //             deadline: Math.floor(Date.now() / 1000) + 60 * 20
    //         }       
    //     ]);
    // };

    getIncreaseLiquidityCallData(wallet, poolAddress, tokenId, kind, pos, amountA, amountB, isDelta) {
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData(
            "addLiquidityToPool",
            [
                poolAddress, // pool
                tokenId, // tokenId
                [ // params array
                    {
                        kind: kind,  // one of the 4 Kinds (0=static, 1=right, 2=left, 3=both) in uint8
                        pos: pos,
                        isDelta: isDelta,
                        deltaA: amountA,
                        deltaB: amountB
                    }
                    // ... other tuples if needed
                ],
                0, // minTokenAAmount
                0, // minTokenBAmount
                Math.floor(Date.now() / 1000) + 60 * 20 // deadline
            ]
        );
    };


    getDecreaseLiquidityCallData(wallet, pool, tokenId, binId, liquidity, recipient) {
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData('removeLiquidity', [
            pool, // Pool address
            recipient, // recipient address
            tokenId, // LP tokenID
            [
                {
                    binId: binId,   // one of the 4 Kinds (0=static, 1=right, 2=left, 3=both) in uint8
                    amount: liquidity,  // remove amount
                }
            ],
            0, // minTokenAAmount
            0, // minTokenBAmount
            Math.floor(Date.now() / 1000) + 60 * 20 // deadline


        ])
    };

    getCollectCallData(wallet, tokenId, recipient) {
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
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ]);
    }

    getSweepTokenCallData(wallet, token) {
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData('sweepToken', [
            token,
            0,
            wallet.address
        ]);

    };

    async getPool(wallet, tokenA, tokenB, poolFee, width) {
        const factoryContract = this.getFactory(wallet);
        const pool = await factoryContract.lookup(
            floatToFixed(poolFee),
            Math.floor(Math.log(1 + width) / Math.log(1.0001)),
            '10800000000000000000000',
            tokenA,
            tokenB
        )
        return pool
    };

    async getLPPositionIds(wallet) {
        const positionContract = this.getPositionContract(wallet);
        const positionNum = Number(await positionContract.balanceOf(wallet.address));
        return await Promise.all(Array.from({ length: positionNum }, async (_, i) => {
            return Number(await positionContract.tokenOfOwnerByIndex(wallet.address, i));
        }));
    };

    async getLPPositionInfo(wallet, pool, tokenId, kind) {
        const positionInspectorContract = this.getPositionInspectorContract(wallet);
        const {tokenA, tokenB} = await positionInspectorContract.addressBinReservesAllKindsAllTokenIds(wallet.address, pool);
        return{
            tokenA,
            tokenB
        }

        

     };

    async getPoolInfo(wallet, poolAddress) {
        const pool = this.getPoolContract(wallet, poolAddress);
        const [tokenA, tokenB, fee, tickSpacing, state] = await Promise.all([
            pool.tokenA(),
            pool.tokenB(),
            pool.fee(),
            pool.tickSpacing(),
            pool.getState()
            // pool.lookback(),

        ]);
        return {
            tokenA,
            tokenB,
            fee: Number(fee),
            tickSpacing: Number(tickSpacing),
            activeTick: state.activeTick,
            status: state.status,
            binCounter: Number(state.binCounter),
            protocolFeeRatio: Number(state.protocolFeeRatio)
        }
    };

    async getBinPositions(wallet, poolAddress, tick, kind) {
        const pool = this.getPoolContract(wallet, poolAddress);
        const binPositions = await pool.binPositions(tick, kind);
        return Number(binPositions);  // 返回特定的binID
    }

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, pool, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter(wallet);
        const callData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, amount, pool, min);
        const response = await router.multicall([callData], { value: amount });
        return await response.wait();
    };
    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, pool, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter(wallet);
        const callData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, amount, pool, min);
        const response = await router.multicall([callData]);
        return await response.wait();
    };

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, pool, min = ethers.BigNumber.from(0)) {
        const router = this.getRouter(wallet);
        const callData = this.getExactInputSingleCallData(wallet, tokenIn, tokenOut, amount, pool, min);
        const unwrapWETH9CallData = router.interface.encodeFunctionData('unwrapWETH9', [
            floatToFixed(0),
            wallet.address
        ])
        const response = await router.multicall([callData, unwrapWETH9CallData]);
        return await response.wait();
    };

    // async mintLiquidityPosition(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper) {
    //     const callData = this.getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper);
    //     const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
    //     const response = await liquidityManagerContract.multicall([callData])
    //     return await response.wait();

    // };

    async mintETHLiquidityPosition(wallet, poolAddress, tokenId, kind, pos, amountA, amountB, amountETH, isDellta) {
        const callData = this.getIncreaseLiquidityCallData(wallet, poolAddress, tokenId, kind, pos, amountA, amountB, isDellta);
        const router = this.getRouter(wallet);
        const refundETHCallData = router.interface.encodeFunctionData('refundETH')
        const response = await router.multicall([callData, refundETHCallData], { value: amountETH })
        return await response.wait();
    };

    // async increaseLiquidity(wallet, tokenId, amount0Desired, amount1Desired) {


    // };

    async increaseLiquidityToETHPool(wallet, tokenId, amountXDesired, amountYDesired, amountETH) {

        const callData = this.getIncreaseLiquidityCallData(wallet, tokenId, amountXDesired, amountYDesired);
        const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
        const response = await liquidityManagerContract.multicall([callData], { value: amountETH })
        return await response.wait();
    };

    // async decreaseLiquidity(wallet, tokenId, decreasePCT) {

    // };

    async decreaseETHLiquidity(wallet, poolAddress, tokenId, kind, liquidityAmount) {


        // const positionInfo = await this.getLPPositionInfo(wallet, poolAddress, tokenId, kind);
        // const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT);
        const callData = this.getDecreaseLiquidityCallData(wallet, poolAddress, tokenId, kind, liquidityAmount, wallet.address);
        // console.log(callData)
        // const collectCallData = this.getCollectCallData(wallet, tokenId, this.liquidityManagerAddress);
        // const unwrapCallData = this.getUnwrapWETH9Calldata(wallet);
        // const token = (positionInfo.tokenX === this.wETHAddress) ? positionInfo.tokenY : positionInfo.tokenX;
        // const sweepTokenCallData = this.getSweepTokenCallData(wallet, sweepToken);
        const router = this.getRouter(wallet);
        const response = await router.multicall([callData])
        return await response.wait();

    };

    // async decreaseETHAndTokenLiquidity(wallet, tokenId, decreasePCT) {

    // };
};

module.exports = Mavrick;



// const zskrpc = "https://mainnet.era.zksync.io"
// const ethrpc = "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl"
// const provider = new Provider(zskrpc);
// const ethereumProvider = new ethers.getDefaultProvider(ethrpc);
// const walletPath = '/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv';

// const wETHAddress = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
// const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
// const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
// const poolFee = 0.02 / 100;
// const width = 0.02
// const amount = floatToFixed(100, 6)
// const amountA = floatToFixed(0, 6)
// const amountB = floatToFixed(0.001, 18)


// const walletData = convertCSVToObjectSync(walletPath);
// const wallet = new Wallet(walletData[0]['PrivateKey'], provider, ethereumProvider);

// const mavrick = new Mavrick();

// tokenApprove(wallet, usdcAddress, mavrick.routerAddr, amount);

// mavrick.getPool(wallet, wETHAddress, usdcAddress, poolFee, width).then(console.log)
// mavrick.getPoolInfo(wallet, '0x41c8cf74c27554a8972d3bf3d2bd4a14d8b604ab').then(console.log)
// mavrick.getBinPositions(wallet, '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB', 380, 0).then(console.log)
// mavrick.mintETHLiquidityPosition(wallet, '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB', 0, 0, 380, amountA, amountB, amountB, true).then(console.log)
// mavrick.getLPPositionIds(wallet).then(console.log);
// mavrick.decreaseETHLiquidity(wallet, '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB', 219662, 0, amountB);
// mavrick.getLPPositionInfo(wallet,'0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB', '219662', 0);

// struct AddLiquidityParams {
//     uint8 kind;
//     int32 pos;
//     bool isDelta;
//     uint128 deltaA;
//     uint128 deltaB;
// }
// kind : one of the 4 Kinds (0=static, 1=right, 2=left, 3=both) in uint8
// pos : The bin position in int32
// isDelta : A boolean that indicates whether the bin position is relative to the current bin or an absolute position
// deltaA : The amount of A token uint128 to add
// deltaB : The amount of B token uint128 to add