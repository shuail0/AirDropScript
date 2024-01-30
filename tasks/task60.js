/**
 * ekubo交互程序
 * 1.在ekubo ETH-USDC 0.05%的池子组单边LP （ 存入ETH）
 * 2.存入ETH数量为账户余额-0.02ETH。
 * 3.反复存取2次后销毁仓位NFT。
 */
const { fetchToken, getBalance } = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep, nearestUsableTick, floatToFixed } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').starkNet
const Ekubo = require('../protocol/starknet/dex/ekubo/ekubo.js');
const ethers = require('ethers')

module.exports = async (params) => {
    const { account } = params;
    // 可配参数

    // 手续费和tickspacing 计算方式： https://docs.ekubo.org/integration-guides/reference/reading-pool-price
    const poolFee = '170141183460469235273462165868118016'  // 0.05%池子， 计算公式 0.05%*(2**128)
    const tickSpacing = 1000;

    const loopNum = 2 // 重复次数
    const ETH = await fetchToken(coinAddress.ETH, account);
    const USDC = await fetchToken(coinAddress.USDC, account);
    // // 查询账户余额
    const randomAmount = getRandomFloat(0.0001, 0.0003);
    ETH.amount = floatToFixed(randomAmount, 18) // 预留0.02ETH作为gas费
    USDC.amount = floatToFixed(0);

    const ekubo = new Ekubo();


    const poolKey = ekubo.getPoolKey(ETH.address, USDC.address, poolFee, tickSpacing);

    const poolPrice = await ekubo.getPoolPrice(account, poolKey);

    let tickLower, tickUpper;
    if (Number(poolKey.token0) === Number(USDC.address)) {
        // ETH在左边，向上增加40-50个tickspacing
        tickLower = nearestUsableTick(poolPrice.tick + Number(poolKey.tick_spacing) * 40, Number(poolKey.tick_spacing));
        tickUpper = nearestUsableTick(poolPrice.tick + Number(poolKey.tick_spacing) * 50, Number(poolKey.tick_spacing));
    } else {
        // ETH在右边，向下减40-50个tickspacing
        tickUpper = nearestUsableTick(poolPrice.tick - Number(poolKey.tick_spacing) * 50, Number(poolKey.tick_spacing));
        tickLower = nearestUsableTick(poolPrice.tick - Number(poolKey.tick_spacing) * 40, Number(poolKey.tick_spacing));

    };



        // // mint LP 仓位
        console.log('开始创建LP仓位', 'tickLower:', tickLower, 'tickUpper:', tickUpper, 'ETH数量', fixedToFloat(ETH.amount, ETH.decimal), 'USDC数量：',  fixedToFloat(USDC.amount, USDC.decimal))
        tx = await ekubo.mintLiquidityPosition(account, ETH.address, USDC.address, poolFee, tickSpacing, tickLower, tickUpper, ETH.amount, USDC.amount);
        sleepTime = getRandomFloat(1, 3);
        console.log('mint成功，交易哈希：', tx, ',随机暂停', sleepTime, '分钟后移除流动性');
        // await sleep(sleepTime);
        // // 获取最后一个仓位信息
        // // console.log('开始获取仓位信息')
        // const Positions = await ekubo.getLpPositions(account);
        // // console.log(Positions)
        // const lastPositionId = Positions[Positions.length - 1]['id']; // 获取最后一个仓位的ID

        // // // 移除流动性 + 销毁NFT
        // console.log('开始移除流动性并销毁仓位NFT');
        // tx = await ekubo.decreaseLiquidityAndBurnPosition(account, lastPositionId, 1, ETH.address, USDC.address, poolFee, tickSpacing, tickLower, tickUpper);
        // sleepTime = getRandomFloat(1, 3);
        // console.log('移除流动性成功,交易哈希：', tx, '，随机暂停', sleepTime, '分钟后重新添加流动性');
        // await sleep(sleepTime);



};