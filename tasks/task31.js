/**
 * 在pancake中添加单边流动性
 *  1. 在UDSC/wETH 0.05%流动性池 mint流动性仓位。
 *  2. 反复存取流动性仓位5次。
 *  3. 取出所有流动性
 * 
 */

const tasks = require('.');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick } = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const PancakeSwap = require('../protocol/zksync/dex/pancakeswap/pancakeswap');
const coinAddress = require('../config/tokenAddress.json').zkSync


module.exports = async (params) => {
    const {wallet} = params;
    // 参数配置
    const poolFee = 500;

    // 获取参数信息
    const tokenA = await fetchToken(coinAddress.WETH, wallet);
    const tokenB = await fetchToken(coinAddress.USDC, wallet);

    const ethBalance = await getBalance(wallet);  // 查询余额
    tokenA.amount = ethBalance.sub(floatToFixed(0.02));  // 预留0.02ETH作为gas
    tokenB.amount = floatToFixed(0, tokenB.decimal)
    const loopNum = 1  // 反复存取次数不算mint。


    const pancake = new PancakeSwap();

    // 获取池信息
    const poolInfo = await pancake.getPoolInfo(wallet, tokenA.address, tokenB.address, poolFee);    

    const [token0, token1] = (poolInfo.token0 === tokenA.address) ? [tokenA, tokenB] : [tokenB, tokenA];

    let tickLower, tickUpper;
    if (poolInfo.token0 === tokenA.address) {
        tickLower = nearestUsableTick(Number(poolInfo.tick) * (1 + 0.2), poolInfo.tickSpacing);
        tickUpper = nearestUsableTick(Number(poolInfo.tick) * (1 + 0.3), poolInfo.tickSpacing);

    } else {
        tickLower = nearestUsableTick(Number(poolInfo.tick) * (1 - 0.3), poolInfo.tickSpacing);
        tickUpper = nearestUsableTick(Number(poolInfo.tick) * (1 - 0.2), poolInfo.tickSpacing);
    }
    
    // mint LP仓位
    console.log('开始授权')
    await tokenApprove(wallet, tokenB.address, pancake.v3SwapRouterAddress, (tokenB.amount).mul(10));

    console.log('开始创建LP仓位')

    const mintInfo = await pancake.mintETHLiquidityPosition(wallet, token0.address, token1.address, poolFee, token0.amount, token1.amount, tickLower, tickUpper)
    console.log('mint成功，交易哈希：',mintInfo.transactionHash)


    console.log('获取仓位信息')

    const positionIds = await pancake.getLPPositionIds(wallet);
    const lastPositionId = positionIds[positionIds.length - 1]; // 获取最后一个仓位的ID

    // const positionInfo = await pancake.getLPPositionInfo(wallet,lastPositionId);
    // 取出所有流动性
    await pancake.decreaseETHLiquidity(wallet, lastPositionId, 1);


    // // 反复存取
    // for (let i = 0; i < loopNum; i++) {
    //     console.log('开始增加流动性')
    //     await pancake.increaseLiquidityToETHPool(wallet, lastPositionId, token0.amount, token1.amount, tokenA.amount);
    //     const sleepTime = getRandomFloat(1, 3);
    //     console.log('增加流动性成功，随机暂停', sleepTime, '分钟后移除流动性');
    //     await sleep(sleepTime);
    //         // 取出所有流动性
    //     console.log('取出所有流动性')
    //     await pancake.decreaseETHLiquidity(wallet, lastPositionId, 1);
    //     if (i < (loopNum)){
    //         const sleepTime = getRandomFloat(1, 3);
    //         console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新添加流动性');
    //         await sleep(sleepTime);
    //     };
    // };

};
