/**
 * mySWP交互程序
 * 1.在myswap ETH-USDC 0.05%的池子组单边LP （ 存入ETH）
 * 2.存入ETH数量为账户余额-0.02ETH。
 * 3.反复存取2次后销毁仓位NFT。
 */
const { fetchToken, getBalance } = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep, nearestUsableTick, floatToFixed } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').starkNet
const MySwap = require('../protocol/starknet/dex/mySwap/myswap.js');


function replaceLastDigitWithTwo(number) {
    let numStr = number.toString();
    if (numStr[numStr.length - 1] !== '2') {
        numStr = numStr.substring(0, numStr.length - 1) + '2';
    }
    return parseInt(numStr, 10);
}


module.exports = async (params) => {
    const { account } = params;
    // 可配参数
    const poolFee = 500
    const ETH = await fetchToken(coinAddress.ETH, account);
    const USDC = await fetchToken(coinAddress.USDC, account);

    // // 查询账户余额
    const ethBalance = await getBalance(account, coinAddress.ETH);
    ETH.amount = ethBalance.sub(floatToFixed(0.02)) // 预留0.02ETH作为gas费
    USDC.amount = floatToFixed(0);

    const myswap = new MySwap();
    const poolInfo = await myswap.getCLPoolInfo(account, ETH.address, USDC.address, poolFee);
    const [token0, token1] = (Number(poolInfo.token0) === Number(ETH.address)) ? [ETH, USDC] : [USDC, ETH];


    let tickLower, tickUpper;
    if (Number(poolInfo.token0) === Number(ETH.address)) {
        // ETH在左边，向上增加40-50个tickspacing
        tickLower = replaceLastDigitWithTwo(poolInfo.tick + poolInfo.tickSpacing * 40);
        tickUpper = replaceLastDigitWithTwo(poolInfo.tick + poolInfo.tickSpacing * 50);
    } else {
        // ETH在右边，向下减40-50个tickspacing
        tickLower = replaceLastDigitWithTwo(poolInfo.tick - poolInfo.tickSpacing * 50);
        tickUpper = replaceLastDigitWithTwo(poolInfo.tick - poolInfo.tickSpacing * 40);
    };


    // mint LP 仓位
    console.log('开始创建LP仓位')
    let tx = await myswap.mintCLLiquidityPosition(account, token0.address, token1.address, poolFee, tickLower, tickUpper, token0.amount, token1.amount);
    let sleepTime = getRandomFloat(1, 3);
    console.log('mint成功，交易哈希：', tx, ',随机暂停', sleepTime, '分钟后移除流动性');
    await sleep(sleepTime);

    // 获取最后一个仓位信息
    const positionIds = await myswap.getLPPositionIds(account);
    const lastPositionId = positionIds[positionIds.length - 1]; // 获取最后一个仓位的ID

    // 移除流动性
    console.log('开始移除所有流动性')
    tx = await myswap.decreaseCLLiquidity(account, lastPositionId, 1)
    sleepTime = getRandomFloat(1, 3);
    console.log('移除流动性成功,交易哈希：', tx, '，随机暂停', sleepTime, '分钟后重新添加流动性');
    await sleep(sleepTime);

    // 增加流动性
    console.log('开始重新添加流动性')
    tx = await myswap.increaseCLLiquidity(account, lastPositionId, token0.address, token1.address, token0.amount, token1.amount);
    sleepTime = getRandomFloat(1, 3);
    console.log('增加流动性成功,交易哈希：', tx, '，随机暂停', sleepTime, '分钟后移除流动性并销毁仓位');


    // 移除流动性 + 销毁NFT
    console.log('开始移除流动性并销毁仓位NFT');
    tx = await myswap.decreaseCLLiquidityAndBurnPosition(account, lastPositionId);
    console.log('成功移除流动性并销毁仓位NFT,哈希：', tx);

};