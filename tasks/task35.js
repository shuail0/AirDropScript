/**
 * 在zeroLend中存取资金
 *  1. 反复存取1个ETH5次。
 * 
 */


const tasks = require('.');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick, fixedToFloat } = require('../base/utils');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../base/coin/token');
const ZeroLend = require('../protocol/zksync/lending/zerolend/zerolend');
const { BigNumber } = require('ethers');
const coinAddress = require('../config/tokenAddress.json').zkSync


module.exports = async (params) => {
    const {wallet} = params;

    const ethBalance = await getBalance(wallet);  // 查询余额
    const amount = ethBalance.sub(floatToFixed(0.02));  // 预留0.02ETH作为gas
    const loopNum = 2;

    const zerolend = new ZeroLend();

    // 授权

    let approveTx = await zerolend.aTokenApprove(wallet, zerolend.aWETHToken, zerolend.WrappedTokenGatewayV3Addr, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
    console.log('approveTx:', approveTx)


    // 反复存取
    for (let i = 0; i < loopNum; i++) {

        console.log('存入数量', fixedToFloat(amount), ' 开始存入ETH');
    
        let tx = await zerolend.supplyEth(wallet, amount);
        let sleepTime = getRandomFloat(1, 2);
        console.log('交易成功 txHash:', tx.transactionHash,'，随机暂停', sleepTime, '分钟后移除取出资金');
    

    
        tx = await zerolend.withdrawEth(wallet, BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));
        console.log('交易成功 txHash:', tx.transactionHash)

        sleepTime = getRandomFloat(1, 2);
        console.log('移除流动性成功，随机暂停', sleepTime, '分钟后重新存入资金');
        await sleep(sleepTime);

    };
    // 授权
    console.log('将无限授权改为0')
    approveTx = await zerolend.aTokenApprove(wallet, zerolend.aWETHToken, zerolend.WrappedTokenGatewayV3Addr, BigNumber.from("0"));
    console.log('approveTx:', approveTx)

};
