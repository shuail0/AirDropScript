/**
 * task58: myswap 交互
 * 1. 查询账户ETH余额
 * 2. 将10%-20%（随机）的ETH随机兑换为tokens中的一个币。
 * 3. 暂停一段时间后再换回ETH。
 */
const {fetchToken, getBalance} = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep, getRandomElement } = require('../base/utils.js');
const  MySwap = require('../protocol/starknet/dex/mySwap/myswap.js');

module.exports = async (params) => {
    // 可以交易的token列表
    const tokens = [
        // {name: 'ETH', address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'},
        {name: 'USDC', address: '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'},
        {name: 'DAI', address: '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3'},
        {name: 'UDC', address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8'},
        {name: 'WBTC', address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac'}
    ];
    // const tokenAAddr = tokens[0]['address'] // 第一个币固定为ETH
    const tokenAAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
    const tokenBAddr = getRandomElement(tokens)['address']; // 随机选一个token

    const minPct = 0.1
    const maxPct = 0.2
    
    const randomPct = getRandomFloat(minPct, maxPct);
    const { account } = params;
    const myswap = new MySwap();
    //  获取代币信息
    const tokenA = await fetchToken(tokenAAddr, account);
    const tokenB = await fetchToken(tokenBAddr, account);


    console.log(`开始执行任务, tokenA: ${tokenA['symbol']}, tokenB: ${tokenB['symbol']}`)
    // 查询tokenA余额
    const tokenABalance = await getBalance(account, tokenA.address);
    console.log(tokenA['symbol'], '余额查询成功,余额：', fixedToFloat(tokenABalance, tokenA['decimal']));

    // 计算交换数量
    const swapAmount = multiplyBigNumberWithDecimal(tokenABalance, randomPct)
    console.log('随机比例：', randomPct, '随机交易数量', fixedToFloat(swapAmount, tokenA.decimal), '开始交易');

    // // 交易
    let tx = await myswap.swapTokenToToken(account, tokenA.address, tokenB.address, swapAmount);
    const sleepTime = getRandomFloat(1, 15);
    console.log('交易成功，tx:', tx, ',随机暂停', sleepTime, '分钟！');
    await sleep(sleepTime);

    // 查询tokenB余额
    const tokenBalance = await getBalance(account, tokenB.address);
    console.log(tokenB['symbol'], '余额查询成功,余额：', fixedToFloat(tokenBalance, tokenB.decimal), '开始交易');

    // 将tokenB换成TokenA
    tx = await myswap.swapTokenToToken(account, tokenB.address, tokenA.address, tokenBalance);
    console.log('交易成功，tx:', tx, ',任务结束');
};