/**
 * 在reactor中存取资金
 *  1. 反复存取1个ETH5次。
 * 
 */


const tasks = require('.');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick, fixedToFloat } = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const Reactorfusion = require('../protocol/zksync/lending/reactorfusion/rectorfusion');
const coinAddress = require('../config/tokenAddress.json').zkSync


module.exports = async (params) => {
    const {wallet} = params;

    // 随机交易数量
    let amount = floatToFixed(1);

    const loopNum = 2  // 反复存取次数。
    // 反复存取 5次
    for (let i = 0; i < loopNum; i++) {

        const reactorfusion = new Reactorfusion();
        // // 查询账户余额
        const ethBalance = fixedToFloat(await getBalance(wallet, coinAddress.ETH));
        console.log('账户ETH余额：', ethBalance);

        console.log('存入数量', fixedToFloat(amount), ' 开始存入ETH');
    
        let tx = await reactorfusion.supplyEth(wallet, amount);
        let sleepTime = getRandomFloat(1, 2);
        console.log('交易成功 txHash:', tx.transactionHash,'，随机暂停', sleepTime, '分钟后移除取出资金');
    
        await sleep(sleepTime);
        const frEthBalance = await getBalance(wallet, reactorfusion.rfETHAddr);
        console.log('rfEth余额：', fixedToFloat(frEthBalance), '开始取出ETH')
    
        tx = await reactorfusion.withdrawEth(wallet, frEthBalance);
        console.log('交易成功 txHash:', tx.transactionHash)

        sleepTime = getRandomFloat(1, 2);
        console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新存入资金');
        await sleep(sleepTime);

    };

};
