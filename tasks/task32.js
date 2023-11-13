/**
 * 在Mavrick中添加单边流动性
 *  1. 在UDSC/wETH 0.2%流动性池 mint流动性仓位，存入0.95ETH。
 *  2. 反复存取流动性仓位5次。
 *  3. 取出所有流动性
 */
const tasks = require('.');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick } = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const coinAddress = require('../config/tokenAddress.json').zkSync

const Mavrick  = require('../protocol/zksync/dex/mavrick/mavrick');
const { ethers } = require('ethers');
const retry = async (fn, args = [], retries = 3, interval = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error on attempt ${i + 1}:`, error.message);
            if (i < retries - 1) {
                console.log(`Waiting for ${interval} seconds before retrying...`);
                await sleep(interval);
            } else {
                console.error('No more retries left.');
                throw error;
            }
        }
    }
}


module.exports = async (params) => {
    const {wallet} = params;

    // 查询代币信息
    let wETH = await fetchToken(coinAddress.WETH, wallet);
    let USDC = await fetchToken(coinAddress.USDC, wallet);


    const poolFee = 0.02 / 100;  // 池子手续费
    const width = 0.02; // Bin的宽度，这里是2%
    wETH.amount = floatToFixed(0.95, wETH.decimal)
    USDC.amount = floatToFixed(0, USDC.decimal)

    const mavrick = new Mavrick();

    // 获取池信息

    const poolInfo = await mavrick.getPoolInfo(wallet, wETH.address, USDC.address, poolFee, width);
    const [tokenA, tokenB] = (poolInfo.tokenA === wETH.address) ? [wETH, USDC] : [USDC, wETH];


    let tick;  // 确定LP的位置
    if (poolInfo.tokenA === wETH.address) {
        tick = Number(poolInfo.activeTick) -  3;  // wETH 是tokenA，pos要比现在的小
    } else {
        tick = Number(poolInfo.activeTick) +  3;
    }    


    // mint LP仓位

    console.log('开始创建LP仓位')

    const mintInfo = await mavrick.mintETHLiquidityPosition(wallet, poolInfo.poolAddress, 0, 0, tick, tokenA.amount, tokenB.amount, wETH.amount);
    console.log('创建成功，交易哈希：',mintInfo.transactionHash);


    console.log('获取仓位IDs')
    const positionIds = await mavrick.getLPPositionIds(wallet);
    const lastPositionId = positionIds[positionIds.length - 1]; // 获取最后一个仓位的ID
    console.log('lastPositionId:', lastPositionId)


    // 取出所有流动性
    console.log('开始授权')
    await mavrick.positionApprove(lastPositionId);
    console.log('取出所有流动性')
    const tx = await mavrick.decreaseETHLiquidity(wallet, tokenA.address, tokenB.address, poolFee, width, lastPositionId, tick);
    console.log('取出成功，交易哈希：',ttx.transactionHash)

    // 反复存取 4次
    for (let i = 0; i < 4; i++) {
        console.log('开始循环增加流动性')
        const mintInfo = await mavrick.mintETHLiquidityPosition(wallet, poolInfo.poolAddress, 0, 0, tick, tokenA.amount, tokenB.amount, wETH.amount);
        console.log('创建成功，交易哈希：',mintInfo.transactionHash);

        const sleepTime = getRandomFloat(1, 3);
        console.log('增加流动性成功，随机暂停', sleepTime, '分钟后移除流动性');
        await sleep(sleepTime);
            // 取出所有流动性
        console.log('取出所有流动性')
        const tx = await mavrick.decreaseETHLiquidity(wallet, tokenA.address, tokenB.address, poolFee, width, lastPositionId, tick);
        console.log('取出成功，交易哈希：',ttx.transactionHash)
        if (i < (5-1)){
            const sleepTime = getRandomFloat(1, 3);
            console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新添加流动性');
            await sleep(sleepTime);
        };
    };


};