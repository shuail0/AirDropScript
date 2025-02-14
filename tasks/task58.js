/**
 * 在izumi中添加单边流动性
 *  1. 查询最后一个LP仓位ID。
 *  2. 向最后一个仓位存取一次流动性。
 * 
 */
const tasks = require('.');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick } = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const Izumi  = require('../protocol/zksync/dex/izumi/izumi');
const coinAddress = require('../config/tokenAddress.json').zkSync


module.exports = async (params) => {
    const {wallet} = params;
    // 参数配置
    const poolFee = 2000;

    // 获取参数信息
    const tokenA = await fetchToken(coinAddress.WETH, wallet);
    const tokenB = await fetchToken(coinAddress.USDC, wallet);
    const ethBalance = await getBalance(wallet);  // 查询余额
    tokenA.amount = ethBalance.sub(floatToFixed(0.02));  // 预留0.02ETH作为gas
    tokenB.amount = floatToFixed(0, tokenB.decimal)
    const loopNum = 1  // 反复存取次数不算mint。


    const izumi = new Izumi();

    // 获取池信息

    const poolInfo = await izumi.getPoolInfo(wallet, tokenA.address, tokenB.address, poolFee);
    const [tokenX, tokenY] = (poolInfo.tokenX === tokenA.address) ? [tokenA, tokenB] : [tokenB, tokenA];

    let tickLower, tickUpper;
    if (poolInfo.tokenX === tokenA.address) {
        tickLower = nearestUsableTick(Number(poolInfo.currentPoint) * (1 + 0.2), poolInfo.pointDelta);
        tickUpper = nearestUsableTick(Number(poolInfo.currentPoint) * (1 + 0.3), poolInfo.pointDelta);

    } else {
        tickLower = nearestUsableTick(Number(poolInfo.currentPoint) * (1 - 0.3), poolInfo.pointDelta);
        tickUpper = nearestUsableTick(Number(poolInfo.currentPoint) * (1 - 0.2), poolInfo.pointDelta);
    }

    
    // mint LP仓位
    console.log('开始授权')
    await tokenApprove(wallet, tokenB.address, izumi.liquidityManagerAddress, floatToFixed(100, tokenB.decimal));

    // console.log('开始创建LP仓位')

    // const mintInfo = await izumi.mintETHLiquidityPosition(wallet, tokenX.address, tokenY.address, poolFee, tokenX.amount, tokenY.amount, tickLower, tickUpper);
    // console.log(mintInfo.transactionHash)

    console.log('获取仓位信息')

    const positionIds = await izumi.getLPPositionIds(wallet);
    const lastPositionId = positionIds[positionIds.length - 1]; // 获取最后一个仓位的ID

    // const positionInfo = await izumi.getLPPositionInfo(wallet,lastPositionId);
    // // 取出所有流动性
    // console.log('取出所有流动性')
    // await izumi.decreaseETHLiquidity(wallet, lastPositionId, 1, tokenB.address);
    
    
    // 反复存取
    for (let i = 0; i < loopNum; i++) {
        console.log('开始循环增加流动性')
        await izumi.increaseLiquidityToETHPool(wallet, lastPositionId, tokenX.amount, tokenY.amount, tokenA.amount);
        const sleepTime = getRandomFloat(1, 3);
        console.log('增加流动性成功，随机暂停', sleepTime, '分钟后移除流动性');
        await sleep(sleepTime);
            // 取出所有流动性
        console.log('取出所有流动性')
        await izumi.decreaseETHLiquidity(wallet, lastPositionId, 1, tokenB.address);
        if (i < (loopNum)){
            const sleepTime = getRandomFloat(1, 3);
            console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新添加流动性');
            await sleep(sleepTime);
        };
    };

};
