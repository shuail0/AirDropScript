/**
 * tasks503 : Shoebill交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将20-30%在Kim上兑换成stone
 *  4.查询stone余额，并将所有stone存入Shoebill
 *  5.随机等待1-5分钟后取出stone
 *  6.把所有stone在Kim上换回ETH
 */

const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const Kim = require('../protocol/mode/dex/kim/kim.js');
const ShoeBill = require('../protocol/mode/lending/shoebill/shoebill.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const kim = new Kim(wallet);
    const shoebill = new ShoeBill(wallet);
    // // 查询代币信息
    const STONE = await fetchToken(coinAddress.STONE, wallet);
    const sbSTONE = await fetchToken(shoebill.sbStoneAddr, wallet);
    // const ironEzETH = await fetchToken(ironclad.ironEzETHAddr, wallet);
    // const ezETH = await fetchToken(coinAddress.ezETH, wallet);
    const wETH = await fetchToken(coinAddress.wETH, wallet);


    // 查询账户余额
    const ethBalance = fixedToFloat(await wallet.getBalance());
    console.log('账户ETH余额：', ethBalance);
    // // // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.4 // 最大交易数量
    // // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')
    let swapTx = await kim.swapEthToToken(wETH.address, STONE.address, amount);
    console.log('买入成功，hash：', swapTx, '开始检查授权')

    await sleep(0.1);

    // 查询stone余额
    let stoneBalance = await getErc20Balance(wallet, STONE.address);
    console.log('stone余额：', fixedToFloat(stoneBalance, STONE.decimal),'开始检查授权...');

    // 存入stone
    await checkApprove(wallet, STONE.address, shoebill.sbStoneAddr, stoneBalance);
    let tx = await shoebill.supply(stoneBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 取出stone
    const sbSTONEBalance = await getErc20Balance(wallet, shoebill.sbStoneAddr);
    console.log('质押余额:', fixedToFloat(sbSTONEBalance, sbSTONE.decimal), '开始检查授权...');
    console.log('开始取出stone');
    tx = await shoebill.redeemToken(sbSTONEBalance);
    console.log('交易成功 txHash:', tx.transactionHash);

    await sleep(0.2);

    //把Stone换回ETH
    stoneBalance = await getErc20Balance(wallet, STONE.address);
    console.log('stone余额：', fixedToFloat(stoneBalance, STONE.decimal),'开始检查授权...');
    await checkApprove(wallet, STONE.address, kim.swapRouterAddr, stoneBalance);

    tx = await kim.swapTokenToEth(STONE.address, wETH.address, stoneBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
}