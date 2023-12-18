/**
 * tasks7 : mavrick交互程序：
 *  1.传入wallet类。
 *  2.将0.001-0.002ETH兑换为USDC
 *  3.查询账户USDC余额
 *  4.Mint USD+
 *  5.将USD+换成USDC
 *  6.将USDC换成ETH。
 */

const Mavrick = require('../protocol/zksync/dex/mavrick/mavrick');
const { getSwapTokenAddress, fetchToken, getBalance, checkUSDCApprove } = require('../base/coin/token.js');
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js');
const Overnight = require('../protocol/zksync/other/overnight/overnight');
const ethers = require('ethers');
const coinAddress = require('../config/tokenAddress.json').zkSync


module.exports = async (params) => {
    const { wallet } = params
    const mavrick = new Mavrick();
    const overnight = new Overnight();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    const usdplusAddress = '0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);
    const usdPluse = await fetchToken(usdplusAddress, wallet);
    
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
    let usdcLogs = tx.logs.filter(log => log.address.toLowerCase() === usdc.address.toLowerCase() && ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.address.toLowerCase());
    let usdcAmount = ethers.BigNumber.from(usdcLogs[0].data); // 获得的USDC数量

    await sleep(1);

    // // 查询USDC余额
    console.log('获得USDC数量：', fixedToFloat(usdcAmount, usdc.decimal), '开始检查授权...');
    await checkUSDCApprove(wallet, usdc.address, overnight.exchangeAddr, usdcAmount);
    console.log('开始Mint USD+...');
    tx = await overnight.mint(wallet, usdcAddress, usdcAmount);
    console.log('交易成功，hash：',tx.transactionHash)
    
    await sleep(1);
    const usdPlusBalance = await getBalance(wallet, usdPluse.address);
    console.log('USD+余额：', fixedToFloat(usdPlusBalance), '开始检查授权...');
    await checkUSDCApprove(wallet, usdPluse.address, mavrick.routerAddr, usdPlusBalance);
    tx = await mavrick.swapTokenToToken(wallet, usdPluse.address, usdc.address, usdPlusBalance, '0xaca5d8805d6f160eb46e273e28169ddbf703ecdc');
    console.log('交易成功 txHash:', tx.transactionHash);
    usdcLogs = tx.logs.filter(log => log.address.toLowerCase() === usdc.address.toLowerCase() && ("0x" + log.topics[2].slice(-40)).toLowerCase() === wallet.address.toLowerCase());
    usdcAmount = ethers.BigNumber.from(usdcLogs[0].data); // 获得的USDC数量

    await sleep(0.5);
    console.log('获得USDC数量：', fixedToFloat(usdcAmount, usdc.decimal), '开始检查授权...');
    await checkUSDCApprove(wallet, usdc.address, mavrick.routerAddr, usdcAmount);
    tx = await mavrick.swapTokenToEth(wallet, usdc.address, wETH.address, usdcAmount, '0x41c8cf74c27554a8972d3bf3d2bd4a14d8b604ab');
    console.log('交易成功 txHash:', tx.transactionHash)

};

