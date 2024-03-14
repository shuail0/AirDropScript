/**
 * tasks228: FringeFi交互程序
 * 1. 查询usdc数量，存入0.001-0.007usdc
 * 2. 查询fWETH数量
 * 3. 取出WETH
 */

const FringeFi = require('../protocol/zksync/lending/fringe/fringe.js');
const { fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js')
const ethers = require('ethers');



module.exports = async (params) => {
    const { wallet } = params
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const usdcAddress = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
    const usdtAddress = '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C';

    const fringefi = new FringeFi();

     // 查询代币信息
     const usdc = await fetchToken(usdcAddress, wallet);
     const usdt = await fetchToken(usdtAddress, wallet);

    //查询账户USDC余额
    // while (true) {
    //     try {
    //         const usdcBalance = await getBalance(wallet, usdc.address);
    //         if (fixedToFloat(usdcBalance, usdc.decimal) < 0.0001) { // 如果账户余额小于0.0001个USDC
    //             console.log('当前钱包余额:', fixedToFloat(usdcBalance, usdc.decimal), ',账户余额不足，1分钟后查询USDT余额；');
    //             await sleep(1);
    //         } else {
    //             console.log('当前钱包余额:', fixedToFloat(usdcBalance, usdc.decimal), ',账户余额充足， 程序继续运行；');
    //             break;
    //         };
    //     } catch (error) {
    //         console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
    //         await sleep(0.5);
    //     };
    // };

    // function getRandomAmount(min, max) {
    //     return ethers.BigNumber.from(Math.floor(Math.random() * (max - min + 1) + min));
    //   }
    //   const minAmount = 0.001 * 1e18; // Convert to wei (1 Ether = 1e18 Wei)
    //   const maxAmount = 0.008 * 1e18;
      
    //   const randomAmount = getRandomAmount(minAmount, maxAmount);
      

    let amount = 50000;////我本来是想做成随机交互50000-100000的usdc，但是发现这个合约的deposit函数是直接传入数量的，所以我就直接写死了
    
    await checkApprove(wallet, usdc.address, fringefi.poolAddr, amount);
    console.log('授权完成，开始存款...');


        
    let tx = await fringefi.deposit(wallet, amount);
    console.log('transaction successful:',tx.transactionHash);

    // await sleep(2);

    // //查询账户fWeth余额
    // const fWethBalance = await getBalance(wallet, zkfox.fWethAddr);
    // console.log('fWeth余额：', fWethBalance, '开始取出ETH')

    // tx = await zkfox.withdraw(wallet, fWethBalance);
    // console.log('交易成功 txHash:', tx.transactionHash)
};