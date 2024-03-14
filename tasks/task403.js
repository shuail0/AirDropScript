/**
 * zkLend交互程序
 * 1.查询账户ETH余额。（token后续作为可配置参数）
 * 2.存入20%-30%的ETH （比例后续作为可配置参数）
 * 3.借出存款金额的40%-60%的ETH （比例后续作为可配置参数)
 * 4.还清所有贷款
 * 5.取出所有存入的ETH。
 */
const {fetchToken, getBalance} = require('../base/coin/stkToken.js');
const {getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep} = require('../base/utils.js');
const ZkLend = require('../protocol/starknet/lending/zklend/zklend.js');


module.exports = async (params) => {

    // 可配参数
    const ethAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
    const minPct = 0.2
    const maxPct = 0.3
    const randomPct = getRandomFloat(minPct, maxPct);
    
    const { account } = params;
    const zklend = new ZkLend();

    const token = await fetchToken(ethAddr);
    // 查询余额
    const tokenBalance = await getBalance(account, token.address);
    console.log('余额查询成功：',token['symbol'],'余额：', fixedToFloat(tokenBalance, token.decimal));

    // 计算质押数量
    const stakeAmount = multiplyBigNumberWithDecimal(tokenBalance, randomPct)
    console.log('随机比例：', randomPct, '随机存入数量', fixedToFloat(stakeAmount, token.decimal), '开始存入资金');

    // 存款
    let tx = await zklend.deposit(account, token.address, stakeAmount);
    const sleepTime = getRandomFloat(5, 15);
    console.log('成功存款，哈希：',tx, '，程序暂停', sleepTime, '分钟后取出资金');
    await sleep(sleepTime);
    // 取款
    // 取出所有资金
    tx = await zklend.withdrawAll(account, ethAddr)
    console.log('成功取出所有', token['symbol'],'哈希：',tx, '任务完成');

};