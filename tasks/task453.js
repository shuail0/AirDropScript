/**
 * zkLend交互程序
 * 1.zkLend账户存取款任务
 * 2.存入ETH数量为账户余额-0.02ETH。
 * 3.反复存取2次。
 */
const { fetchToken, getBalance } = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, floatToFixed, sleep } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').starkNet

const ZkLend = require('../protocol/starknet/lending/zklend/zklend.js');


module.exports = async (params) => {

    const { account } = params;
    // 可配参数
    const ETH = await fetchToken(coinAddress.ETH, account);
    // // 查询账户余额
    const ethBalance = await getBalance(account, coinAddress.ETH);
    ETH.amount = ethBalance.sub(floatToFixed(0.02)) // 预留0.02ETH作为gas费

    const loopNum = 2  // 反复存取次数。


    const zklend = new ZkLend();


    // 查询余额
    console.log('余额查询成功：', ETH['symbol'], '余额：', fixedToFloat(ethBalance), '存入数量', fixedToFloat(ETH.amount, ETH.decimal), '开始存入资金');

    // 反复存取 5次
    for (let i = 0; i < loopNum; i++) {
        let tx, sleepTime;

        // 存款
        tx = await zklend.deposit(account, ETH.address, ETH.amount);
        sleepTime = getRandomFloat(3, 5);
        console.log('成功存款，哈希：', tx, '，程序暂停', sleepTime, '分钟后取出资金');
        await sleep(sleepTime);
        // 取款
        // 取出所有资金
        tx = await zklend.withdrawAll(account, ETH.address)
        if (i < (loopNum - 1)) {
            sleepTime = getRandomFloat(1, 2);
            console.log('成功取出所有', ETH['symbol'], '随机暂停', sleepTime, '分钟后重新存入资金');
            await sleep(sleepTime);
    
        };


    };
};
