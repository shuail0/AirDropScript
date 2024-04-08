/**
 * tasks504 : IronClad交互程序：
 *  1.传入wallet类。
 *  2.查询账户ezETH余额。
 *  3.存入ezETH
 *  4.随机等待1-5分钟后取出ezETH
 */

const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const Kim = require('../protocol/mode/dex/kim/kim.js');
const IronClad = require('../protocol/mode/lending/ironclad/ironclad.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const ironclad = new IronClad(wallet);
    // // 查询代币信息
    const ironEzETH = await fetchToken(ironclad.ironEzETHAddr, wallet);
    const ezETH = await fetchToken(coinAddress.ezETH, wallet);
    const wETH = await fetchToken(coinAddress.wETH, wallet);


    // 查询ezETH余额
    let ezETHBalance = await getErc20Balance(wallet, ezETH.address);
    console.log('ezETH余额：', fixedToFloat(ezETHBalance, ezETH.decimal));

    if (ezETHBalance.lt(floatToFixed(0.0001)) ) {
        console.log('ezETH余额不足，从Kim中买入ezETH');
        const kim = new Kim(wallet);
        const ethBalance = fixedToFloat(await wallet.getBalance());
        console.log('账户ETH余额：', ethBalance);
        // // // 设定随机金额
        const minAmount = ethBalance * 0.2  // 最小交易数量
        const maxAmount = ethBalance * 0.4 // 最大交易数量
        // // 随机交易数量
        let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
        console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')
        let swapTx = await kim.swapEthToToken(wETH.address, ezETH.address, amount);
        console.log('买入成功，hash：', swapTx, '开始检查授权')
    };  

    await sleep(0.1);


    ezETHBalance = await getErc20Balance(wallet, ezETH.address);
    console.log('ezETH余额：', fixedToFloat(ezETHBalance, ezETH.decimal), '开始检查授权...');
    await checkApprove(wallet, ezETH.address, ironclad.proxyContractAddr, ezETHBalance);
    let tx = await ironclad.deposit(ezETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);
    const ironEzETHBalance = await getErc20Balance(wallet, ironEzETH.address);
    console.log('质押余额:', fixedToFloat(ironEzETHBalance, ironEzETH.decimal), '开始检查授权...');
    await checkApprove(wallet, ironEzETH.address, ironclad.proxyContractAddr, ironEzETHBalance);
    console.log('开始取出ezETH');
    tx = await ironclad.withdraw(ironEzETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash);
}