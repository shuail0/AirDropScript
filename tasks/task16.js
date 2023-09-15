/**
 * task14: jediSwap 交互
 * 1. 
 */
const {fetchToken, getBalance} = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep } = require('../base/utils.js');
const JediSwap = require('../protocol/starknet/dex/jediswap/jediswap.js');

module.exports = async (params) => {

    // 连接erc20token
    const ethAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
    const usdtAddr = '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8';
    const minPct = 0.1
    const maxPct = 0.2
    const randomPct = getRandomFloat(minPct, maxPct);

    const { account } = params;
    const jediswap = new JediSwap();
    //  获取代币信息
    const tokenA = await fetchToken(ethAddr, account);
    const tokenB = await fetchToken(usdtAddr, account);


    console.log(`开始执行任务, tokenA: ${tokenA['symbol']}, tokenB: ${tokenB['symbol']}`)
    // 查询tokenA余额
    const tokenABalance = await getBalance(account, tokenA.address);
    console.log(tokenA['symbol'], '余额查询成功,余额：', fixedToFloat(tokenABalance, tokenA['decimal']));

    // 计算交换数量
    const swapAmount = multiplyBigNumberWithDecimal(tokenABalance, randomPct)
    console.log('随机比例：', randomPct, '随机交易数量', fixedToFloat(swapAmount, tokenA.decimal), '开始交易');

    // // 交易
    let tx = await jediswap.swapTokenToToken(account, tokenA.address, tokenB.address, swapAmount);
    const sleepTime = getRandomFloat(1, 15);
    console.log('交易成功，tx:', tx, ',随机暂停', sleepTime, '分钟！');
    await sleep(sleepTime);

    // 查询tokenB余额
    const tokenBalance = await getBalance(account, tokenB.address);
    console.log(tokenB['symbol'], '余额查询成功,余额：', fixedToFloat(tokenBalance, tokenB.decimal), '开始交易');

    // 将tokenB换成TokenA
    tx = await jediswap.swapTokenToToken(account, tokenB.address, tokenA.address, tokenBalance);
    console.log('交易成功，tx:', tx, ',任务结束');

};