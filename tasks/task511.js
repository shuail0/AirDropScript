/**
 * tasks511 : mantissa交互程序：
 *  1.传入wallet类。
 *  2.查询账户USDT余额。
 *  3.若USDT余额为0，则将20-30%在Kim上兑换成USDT
 *  4.查询USDT余额，将所有USDT兑换成USDC
 *  5.随机等待1-5分钟后将USDC兑换回USDT
 *  6.查询USDT余额，并把所有USDT在Kim上换回ETH
 */

const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const Kim = require('../protocol/mode/dex/kim/kim.js');
const MantissaSwap = require('../protocol/mode/dex/Mantissa/mantissa.js');


module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const kim = new Kim(wallet);
    const mantissaswap = new MantissaSwap(wallet);
    // // 查询代币信息
    const wETH = await fetchToken(coinAddress.WETH, wallet);
    const USDT = await fetchToken(coinAddress.USDT, wallet);
    const USDC = await fetchToken(coinAddress.USDC, wallet);


    // 查询账户余额
    const USDTBalance = await getErc20Balance(wallet, USDT.address);
    console.log ('USDT余额：', fixedToFloat(USDTBalance, USDT.decimal), '开始授权...');


    if (USDTBalance.lt(floatToFixed(0.0001)) ) {
        console.log('USDT余额不足，从Kim中买入USDT');
        const kim = new Kim(wallet);
        const ethBalance = fixedToFloat(await wallet.getBalance());
        console.log('账户ETH余额：', ethBalance);
        // // // 设定随机金额
        const minAmount = ethBalance * 0.2  // 最小交易数量
        const maxAmount = ethBalance * 0.3 // 最大交易数量
        // // 随机交易数量
        let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
        console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')
        tx = await kim.swapEthToToken(wETH.address, USDT.address, amount);
        console.log('买入成功，hash：', tx, '开始检查授权')
    };  

    await sleep(2);


    // 查询USDT余额
    USDTBalance = await getErc20Balance(wallet, USDT.address);
    console.log('USDT余额：', fixedToFloat(USDTBalance, USDT.decimal),'开始检查授权...');

    // 用USDT换USDC
    await checkApprove(wallet, USDT.address, mantissaswap.poolAddr, USDTBalance);
    let tx = await mantissaswap.swap(USDT.address, USDC.address, USDTBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 用USDC换回USDT
    const USDCBalance = await getErc20Balance(wallet, USDC.address);
    console.log('USDC余额：', fixedToFloat(USDCBalance, USDC.decimal),'开始检查授权...');
    await checkApprove(wallet, USDC.address, mantissaswap.poolAddr, USDCBalance);
    tx = await mantissaswap.swap(USDC.address, USDT.address, USDCBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
    
    await sleep(1.5);


    // 在Kim上把USDT换回ETH
    USDTBalance = await getErc20Balance(wallet, USDT.address);
    console.log('USDT余额：', fixedToFloat(USDTBalance, USDT.decimal),'开始检查授权...');
    await checkApprove(wallet, USDT.address, kim.swapRouterAddr, USDTBalance);

    tx = await kim.swapTokenToEth(USDT.address, wETH.address, USDTBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
}