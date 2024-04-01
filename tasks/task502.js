/**
 * tasks103: Ionic交互程序  
 * 1. 查询账户ezETH余额信息
 * 2. 将账户中的ezETH全部存入到Ionic中
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");
const Ionic = require('../protocol/mode/lending/ionic/ionic.js');
const coinAddress = require('../config/tokenAddress.json').Mode




module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const ionic = new Ionic(wallet);
    // // 查询代币信息
    const wETH = await fetchToken(coinAddress.wETH, wallet);
    const ezETH = await fetchToken(coinAddress.ezETH, wallet);

    // // 查询ezETH余额
    const ezETHBalance = await getErc20Balance(wallet, ezETH.address);
    console.log('ezETH余额：', fixedToFloat(ezETHBalance, ezETH.decimal), '开始授权...');
    let tx = await ionic.supplyToken(ezETH.address, ezETHBalance);
    console.log('交易成功，hash：', tx.transactionHash)


    // // 赎回资产

    // const itokenAddress = ionic[`ion${ezETH.symbol}Addr`];
    // const itokenBalance = await getErc20Balance(wallet, itokenAddress);
    // console.log('ionToken余额：', fixedToFloat(itokenBalance, ezETH.decimal), '开始赎回...');
    // tx = await ionic.withdrawToken(ezETH.address, itokenBalance);
    // console.log('交易成功，hash：', tx.transactionHash)
};