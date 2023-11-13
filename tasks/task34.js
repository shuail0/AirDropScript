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

    // 随机交易数量
    let amount = floatToFixed(0.95);

    // 反复存取 5次
    for (let i = 0; i < 5; i++) {

        const reactorfusion = new Reactorfusion();
        // // 查询账户余额
        const ethBalance = fixedToFloat(await getBalance(wallet, coinAddress.ETH));
        console.log('账户ETH余额：', ethBalance);

        console.log('存入数量', fixedToFloat(amount), ' 开始存入ETH');
    
        let tx = await reactorfusion.supplyEth(wallet, amount);
        let sleepTime = getRandomFloat(20, 40);
        console.log('交易成功 txHash:', tx.transactionHash,'，随机暂停', sleepTime, '分钟后移除取出资金');
    
        await sleep(sleepTime);
        const frEthBalance = await getBalance(wallet, reactorfusion.rfETHAddr);
        console.log('rfEth余额：', fixedToFloat(frEthBalance), '开始取出ETH')
    
        tx = await reactorfusion.withdrawEth(wallet, frEthBalance);
        console.log('交易成功 txHash:', tx.transactionHash)

        sleepTime = getRandomFloat(20, 40);
        console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新存入资金');
        await sleep(sleepTime);

    };
    console.log('任务结束')

};
