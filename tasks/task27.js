/*
    zept交互程序
        1. 查询账户zept余额
        2. 余额够4000zept则直接mint zept
        3. 余额不够则将eth兑换成zept
*/

const Zpet = require('../protocol/zksync/game/zpet/zpet.js');
const { fetchToken, getBalance, checkApprove, } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep,getRandomFloat} = require('../base/utils.js')
const ethers = require('ethers');
const coinAddress = require('../config/tokenAddress.json').zkSync

module.exports = async (params) => {
    
        const {wallet} = params;
    
        const zpet = new Zpet();
        const ETHAddress = coinAddress.ETH;
        const wETHAddress = coinAddress.wETH;
        const zpetAddress = "0x0C6eaaAb86e8374A91e3F42c726B6FD1aBaCB54c";

        // 查询账户zept余额
        const zpetBalance = fixedToFloat(await getBalance(wallet, zpetAddress));
        console.log('账户zept余额：', zpetBalance);

        // 设定随机金额
        const minAmount = 0.0001  // 最小交易数量
        const maxAmount = 0.0002 // 最大交易数量
        let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));

        // 余额够则直接mint zept
        if(zpetBalance >= 4000){
            console.log('账户zept余额大于4000，开始mint zept')
            let tx = await zpet.mintZpet(wallet);
            console.log('交易成功txHash：', tx.transactionHash)
        }else{
            // 查询代币信息
            console.log('账户zept余额不足，开始兑换zept')
            const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
            console.log('账户ETH余额：', ethBalance);

            // 兑换zept
            console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')
            let tx = await zpet.swapExactETHForTokens(wallet, wETHAddress, zpetAddress, amount);
            console.log('交易成功txHash：', tx.transactionHash)

            // 随机暂停
            const sleepTime = getRandomFloat(1, 5);
            console.log('随机暂停：', sleepTime, '分钟');
            await sleep(sleepTime);

            // mint zept
            tx = await zpet.mintZpet(wallet);
            console.log('交易成功txHash：', tx.transactionHash)
            
        }
}

