/**
 * 项目名称：Maverick
 * 项目链接：https://www.mav.xyz/
 * 项目文档：https://docs.mav.xyz/
 * GitHub：
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth, mintLiquidityPosition, increaseLiquidity, decreaseLiquidity
 * 
 */

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

        this.wETH = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91';
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

    getIncreaseLiquidityCallData(wallet, poolAddress, tokenId, kind, tick, amountA, amountB, isDelta) {
        const router = this.getRouter(wallet);
        return router.interface.encodeFunctionData(
            "addLiquidityToPool",
            [
                poolAddress, // pool
                tokenId, // tokenId
                [ // params array
                    {
                        kind: kind,  // one of the 4 Kinds (0=static, 1=right, 2=left, 3=both) in uint8
                        pos: tick,  //pos 
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
                    binId: binId, // binID是LP所在的Bin
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

    async geBinPositionBalance(wallet, poolAddress, tokenId, binId) {
        const poolContract = this.getPoolContract(wallet, poolAddress);
        return await poolContract.balanceOf(tokenId, binId);
    }

    async getLPPositionInfo(wallet, pool, tokenId, kind) {
        const positionInspectorContract = this.getPositionInspectorContract(wallet);
        const {tokenA, tokenB} = await positionInspectorContract.addressBinReservesAllKindsAllTokenIds(wallet.address, pool);
        return{
            tokenA,
            tokenB
        }
     };

    async getPoolInfo(wallet, tokenA, tokenB, poolFee, width) {
        const poolAddress = await this.getPool(wallet, tokenA, tokenB, poolFee, width);
        const pool = this.getPoolContract(wallet, poolAddress);
        const [_tokenA, _tokenB, fee, tickSpacing, state] = await Promise.all([
            pool.tokenA(),
            pool.tokenB(),
            pool.fee(),
            pool.tickSpacing(),
            pool.getState()
        ]);
        return {
            poolAddress,
            tokenA: _tokenA,
            tokenB: _tokenB,
            fee: Number(fee),
            tickSpacing: Number(tickSpacing),
            activeTick: state.activeTick,
            status: state.status,
            binCounter: Number(state.binCounter),
            protocolFeeRatio: Number(state.protocolFeeRatio)
        }
    };

    async getBinId(wallet, poolAddress, tick, kind=0) {
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

    async positionApprove(wallet,tokenId) {
        const positionContract = this.getPositionContract(wallet);
        const response = await positionContract.approve(this.routerAddr, tokenId);
        return await response.wait();
    };

    // async mintLiquidityPosition(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper) {
    //     const callData = this.getMintLiquidityPositionCallData(wallet, tokenX, tokenY, poolFee, amountX, amountY, tickLower, tickUpper);
    //     const liquidityManagerContract = this.getLiquidityManagerContract(wallet);
    //     const response = await liquidityManagerContract.multicall([callData])
    //     return await response.wait();

    // };

    async mintETHLiquidityPosition(wallet, poolAddress, tokenId, kind, tick, amountA, amountB, amountETH, isDellta=false) {
        const callData = this.getIncreaseLiquidityCallData(wallet, poolAddress, tokenId, kind, tick, amountA, amountB, isDellta);
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


    async decreaseETHLiquidity(wallet, tokenA, tokenB, poolFee, width, tokenId, tick,liquidityAmount=ethers.BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) {
        const poolInfo = await this.getPoolInfo(wallet, tokenA, tokenB, poolFee, width);
        const binId = await this.getBinId(wallet, poolInfo.poolAddress, tick, 0);  // 查询BinID

        // console.log('查询仓位余额信息')
        // const postionBalance = await this.geBinPositionBalance(wallet, poolInfo.poolAddress, tokenId, binId);
        // console.log(postionBalance.toString());

        const callData = this.getDecreaseLiquidityCallData(wallet, poolInfo.poolAddress, tokenId, binId,liquidityAmount, '0x0000000000000000000000000000000000000000');
        const unwrapCallData = this.getUnwrapWETH9Calldata(wallet);
        const sweepToken = (poolInfo.tokenA === this.wETHAddress) ? poolInfo.tokenB : poolInfo.tokenA;
        const sweepTokenCallData = this.getSweepTokenCallData(wallet, sweepToken);
        const router = this.getRouter(wallet);
        const response = await router.multicall([callData, unwrapCallData, sweepTokenCallData])

        return await response.wait();

    };

    // async decreaseETHAndTokenLiquidity(wallet, tokenId, decreasePCT) {

    // };
};

module.exports = Mavrick;


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