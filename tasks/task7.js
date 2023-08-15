/**
 * tasks7 : mavrick交互程序：
 *  1.传入wallet类。
 *  2.将0.001-0.002ETH兑换为USDC
 *  3.查询账户USDC余额
 *  4.Mint USD+
 *  5.销毁 USD+。
 */

const Mavrick = require('../protocol/zksync/dex/mavrick/mavrick');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove } = require('../base/coin/token.js');
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js');
const Overnight = require('../protocol/zksync/other/overnight/overnight');
const ethers = require('ethers');

module.exports = async (wallet) => {

    const mavrick = new Mavrick();
    const overnight = new Overnight();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);
    
    // // 设定随机金额
    const minAmount = 0.001  // 最小交易数量
    const maxAmount = 0.002 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    // // 将ETH兑换成USDC
    console.log('将ETH兑换成USDC')
    let tx = await mavrick.swapEthToToken(wallet, wETH.address, usdc.address, amount, '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB');
    console.log('交易成功txHash：', tx.transactionHash)

    // // 查询USDC余额
    let usdcBalance = await getBalance(wallet, usdc.address);
    console.log('USDC余额：', usdcBalance.toString(), '开始授权...');
    await tokenApprove(wallet, usdc.address, overnight.exchangeAddr, usdcBalance);
    console.log('授权成功，开始mint USD+')
    tx = await overnight.mint(wallet, usdcAddress, usdcBalance);
    console.log('交易成功，hash：',tx.transactionHash)

    await sleep(0.5);

    const usdPlusBalance = await getBalance(wallet, usdplusAddress);
    console.log('USD+余额：', usdPlusBalance.toString(), '开始授权...');
    await tokenApprove(wallet, usdplusAddress, overnight.exchangeAddr, usdPlusBalance); 
    console.log('授权成功，开始redeem USD+');
    tx = await overnight.redeem(wallet, usdcAddress, usdPlusBalance);
    console.log('交易成功，hash：',tx.transactionHash)
 
    usdcBalance = await getBalance(wallet, usdc.address);
    await tokenApprove(wallet, usdc.address, mavrick.routerAddr, usdcBalance);
    console.log('授权成功，将USDC换成ETH')
    tx = await mavrick.swapTokenToEth(wallet, usdc.address, wETH.address, usdcBalance, '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB');
    console.log('交易成功 txHash:', tx.transactionHash)

};

