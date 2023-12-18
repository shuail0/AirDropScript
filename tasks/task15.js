/**
 * Task16 zkswap交互
 * 1. 交易ETH兑换USDC
 * 2. 添加流动性
 * 3. 移除流动性
 * 4. 交易USDC兑换ETH 
 */


const zkswap = require('../protocol/zksync/dex/zkswap/zkswap.js');
const { getSwapTokenAddress, fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat,sleep, getRandomFloat, saveLog  } = require('../base/utils.js')
const ethers = require('ethers');
const { Wallet, Provider } = require('zksync-web3');

module.exports = async (params) => {
    const {wallet} = params;
    const zkswapdex = new zkswap();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);

    // 获取代币价格
    // const wETHPrice = await getPriceFromOracle(wETH.address);
    // const usdcPrice = await getPriceFromOracle(usdc.address);

    // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log('账户ETH余额：', ethBalance);

    // 设定随机金额
    const minAmount = ethBalance * 0.2  // 最小交易数量
    const maxAmount = ethBalance * 0.3 // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机交易数量', amount.toString(), ' 开始交易');

    
    // 将ETH兑换成USDC
    let tx = await zkswapdex.swapExactETHForTokens(wallet, wETH.address, usdc.address, amount);
    console.log('交易成功txHash：', tx.transactionHash);
    
    /* 
    // 添加流动性
    const usdcBalance = await getBalance(wallet, usdc.address);
    console.log('USDC余额：', usdcBalance.toString(), '开始授权...');
    await tokenApprove(wallet, usdc.address, zkswapdex.RouterAddress, usdcBalance);
    console.log('授权成功，开始交易');

    const wETHAmount = usdcBalance.mul(usdcPrice).div(wETHPrice);
    console.log('wETHAmount:', wETHAmount.toString());
   
    // tx = await zkswapdex.addLiquidity(wallet, wETH.address, usdc.address, amount, usdcBalance, wallet.address, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800));
    tx = await zkswapdex.addLiquidity(wallet, wETH.address, usdc.address, wETHAmount, usdcBalance, wallet.address, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800));
    console.log('添加流动性成功 txHash:', tx.transactionHash);

    // 随机暂停
    const sleepTime = getRandomFloat(1, 5) * 60 * 1000; // 将随机休眠时间转换为毫秒
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));

    // 查询流动性
    const lpBalance = await getBalance(wallet, zkswapdex.zfFarmAddress);
    console.log('流动性余额:', lpBalance.toString());

    // 移除流动性
    tx = await zkswapdex.removeLiquidity(wallet, wETH.address, usdc.address, lpBalance, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800));
    console.log('移除流动性成功 txHash:', tx.transactionHash);

     */

    //随机暂停
    const sleepTime = getRandomFloat(1, 5) * 60 * 1000; // 将随机休眠时间转换为毫秒
    console.log('随机暂停：', sleepTime / 1000, '秒');
    await new Promise((resolve) => setTimeout(resolve, sleepTime));


    // 查询USDC余额，兑换回ETH
    usdcBalance = await getBalance(wallet, usdc.address);
    console.log('USDC余额：', usdcBalance.toString(), '开始检查授权...');
    await checkApprove(wallet, usdc.address, zkswapdex.RouterAddress, usdcBalance);
    
    tx = await zkswapdex.swapExactTokensForETH(wallet, usdc.address, wETH.address, usdcBalance);
    console.log('交易成功 txHash:', tx.transactionHash);

};


