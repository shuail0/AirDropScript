/**
 * tasks227: zomma交互程序
 * 1. 查询USDC数量
 * 2. 随机存入0.0001-0.0007 USDC
 * 3. 只存不取
 */

const Zomma = require('../protocol/zksync/dex/zomma/zomma.js');
const SyncSwap = require('../protocol/zksync/dex/syncswap/SyncSwap.js');

const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {

    const { wallet } = params;

    const zomma = new Zomma();
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    const p1ShareAddr = '0xAbe30392e811b9b54591286e601C6c1067333Bca';
    const usdtAddress = '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C';
    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);
    const usdc = await fetchToken(usdcAddress, wallet);
    const usdt = await fetchToken(usdtAddress, wallet);

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

    console.log('开始检查授权并存款...');
    console.log(usdc.address, zomma.poolAddr, floatToFixed(depositAmount, usdc.decimal));
    console.log('授权完成，开始存款...');
    // console.log('存款金额：', amount = 50000));
    let tx = await zomma.deposit(wallet,floatToFixed(depositAmount));
    console.log('transaction successful:',tx.transactionHash);

}
