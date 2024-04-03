/*
    molend交互程序
        1. 存入ETH
        2. 取出ETH
*/


const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const Molend = require('../protocol/mode/lending/molend/molend.js');
const amWeth = "0x4080Ec9B7159FE74e5E4f25304a8aa8293815f16";

module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const molend = new Molend(wallet);
    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.6 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('交易数量：', fixedToFloat(amount));
    let tx = await molend.depositETH(wallet, amount);
    console.log('交易成功，hash：', tx.transactionHash)

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    let amWethBalance = await getErc20Balance(wallet, amWeth);
    console.log('amWeth余额：', fixedToFloat(amWethBalance), '开始取出...');
    // 开始授权
    await checkApprove(wallet, amWeth, molend.molendAddress, amWethBalance);
    tx = await molend.withdrawETH(wallet, amWethBalance);
    console.log('交易成功，hash：', tx.transactionHash)
}