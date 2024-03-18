/**
 * tasks228: FringeFi交互程序
 * 1. 查询usdc数量，存入0.01-0.2usdc
 * 2. 查询fWETH数量
 * 3. 取出WETH
 */

const SyncSwap = require('../protocol/zksync/dex/syncswap/syncswap.js');
const FringeFi = require('../protocol/zksync/lending/fringe/fringe.js');
const { fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js')
const ethers = require('ethers');



module.exports = async (params) => {
    const { wallet } = params


    const fringefi = new FringeFi();

    //查询账户USDC余额
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';

    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);

    const depositAmount = getRandomFloat(0.01, 0.2, usdc.decimal)
    console.log('随机存款数量', depositAmount);

    const usdcBalance = await getBalance(wallet, usdc.address);
    console.log('USDC余额：', fixedToFloat(usdcBalance, usdc.decimal),);
    // bigNumber比较大小
    if (fixedToFloat(usdcBalance, usdc.decimal) < depositAmount) {
        console.log('USDC余额不足，从syncswap将0.0001ETH兑换为USDC');
        const syncswap = new SyncSwap();
        // // 将ETH兑换成USDC
        let tx = await syncswap.swapEthToToken(wallet, wETH.address, usdc.address, floatToFixed(0.0001));
        console.log('交易成功txHash：', tx.transactionHash)
    }
      
    
    await checkApprove(wallet, usdc.address, fringefi.poolAddr, floatToFixed(depositAmount, usdc.decimal));
    console.log('授权完成，开始存款...');


        
    let tx = await fringefi.deposit(wallet, floatToFixed(depositAmount, usdc.decimal));
    console.log('transaction successful:',tx.transactionHash);
};