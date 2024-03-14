/**
 * nostar交互程序
 * 1.zkLend账户存取款任务
 * 2.存入ETH数量为账户余额-0.02ETH。
 * 3.反复存取2次。
 */
const { fetchToken, getBalance } = require('../base/coin/stkToken.js');
const { getRandomFloat, multiplyBigNumberWithDecimal, fixedToFloat, sleep, nearestUsableTick, floatToFixed } = require('../base/utils.js');
const coinAddress = require('../config/tokenAddress.json').starkNet
const Nostra = require('../protocol/starknet/lending/nostra/nostra.js');


module.exports = async (params) => {
    const { account } = params;
    // 可配参数
    const ETH = await fetchToken(coinAddress.ETH, account);
    // // 查询账户余额
    const ethBalance = await getBalance(account, coinAddress.ETH);
    ETH.amount = ethBalance.sub(floatToFixed(0.02)) // 预留0.02ETH作为gas费
    
    const loopNum = 2  // 反复存取次数。


    const nostra = new Nostra();
    const iTokenAddr = nostra['i' + ETH.symbol];


    // 反复存取 5次
    for (let i = 0; i < loopNum; i++) {
        let tx, sleepTime;
        console.log('存入数量', fixedToFloat(ETH.amount), ' 开始存入ETH');
        tx = await nostra.deposit(account, ETH.address, iTokenAddr, ETH.amount);
        sleepTime = getRandomFloat(1, 2);
        console.log('交易成功 txHash:', tx,'，随机暂停', sleepTime, '分钟后移除取出资金');

        await sleep(sleepTime);


        console.log('开始取出ETH')
        tx = await nostra.withdrawAll(account, iTokenAddr);
        console.log('交易成功 txHash:', tx)

        if (i < (loopNum - 1)) {
            sleepTime = getRandomFloat(1, 2);
            console.log( '随机暂停', sleepTime, '分钟后重新存入资金');
            await sleep(sleepTime);
        };

    };

};