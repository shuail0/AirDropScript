/**
 * tasks : pixelswap交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.将eth余额的20%-30%兑换为weth
 *  4.查询账户weth余额
 *  5.将weth兑换为ETH。
 */

const PixelSwap = require('../protocol/zksync/dex/pixelswap/pixelswap.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {

    const {wallet} = params;

    const pixelswap = new PixelSwap();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);

    //查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);
    
    //设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', fixedToFloat(amount), ' 开始交易')

    // 将ETH兑换成wETH
    let tx = await pixelswap.deposit(wallet, amount);    
    console.log('交易成功txHash：', tx.transactionHash)

    await sleep(2);

    // 查询wETH余额

    wETHBalance = await getBalance(wallet, wETH.address);
    console.log('wETH余额：', fixedToFloat(wETHBalance, wETH.decimal));
    

    tx = await pixelswap.withdraw(wallet, wETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

};
