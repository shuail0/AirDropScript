/**
 * tasks227: zomma交互程序
 * 1. 查询USDC数量
 * 2. 随机存入0.0001-0.0007 USDC
 * 3. 只存不取
 */

const Zomma = require('../protocol/zksync/dex/zomma/zomma.js');
const { fetchToken, getBalance, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {

    const {wallet} = params;

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


    let amount = 50000;//我本来是想做成随机交互50000-100000的usdc，但是发现这个合约的deposit函数是直接传入数量的，所以我就直接写死了
    console.log('随机交易数量', amount.toString(), ' 开始交易')

    await checkApprove(wallet, usdc.address, zomma.poolAddr, amount);
    console.log('授权完成，开始存款...');

    let tx = await zomma.deposit(wallet, amount);
    console.log('transaction successful:',tx.transactionHash);
    
}
