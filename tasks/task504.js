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
const IronClad = require('../protocol/mode/lending/ironclad/ironclad.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const ironclad = new IronClad(wallet);
    // // 查询代币信息
    const ironEzETH = await fetchToken(ironclad.ironEzETHAddr, wallet);
    const ezETH = await fetchToken(coinAddress.ezETH, wallet);


    // 查询ezETH余额
    const ezETHBalance = await getErc20Balance(wallet, ezETH.address);
    console.log('ezETH余额：', fixedToFloat(ezETHBalance, ezETH.decimal), '开始授权...');

    await checkApprove(wallet, ezETH.address, ironclad.proxyContractAddr, ezETHBalance);

    let tx = await ironclad.deposit(ezETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash)；

    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    const ironEzETHBalance = await getErc20Balance(wallet, ironEzETH.address);
    console.log('质押余额:', fixedToFloat(ironEzETHBalance, ironEzETH.decimal), '开始授权...');

    await checkApprove(wallet, ironEzETH.address, ironclad.proxyContractAddr, ironEzETHBalance);

    tx = await ironclad.withdraw(ironEzETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash);
};

