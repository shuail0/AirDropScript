/**
 * tasks103: Mode跨链程序  
 * 1. 查询账户余额信息
 * 2. 除去预留的金额外，将余额转入Mode网络
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat } = require("../base/utils.js");
const ModeBridge = require('../protocol/ethereum/bridge/modeBridge/modeBridge.js');



module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Ethereum));
    const gasPrice = await wallet.provider.getGasPrice();
    const gasLimit = 130000;
    let gasFee = gasPrice.mul(gasLimit);
    // 增加10%的手续费
    gasFee = gasFee.mul(110).div(100);
    console.log('预估Gas:', fixedToFloat(gasFee, 18));
    const ETHBalance = await wallet.getBalance();
    console.log('ETH余额:', fixedToFloat(ETHBalance, 18));
    let bridgeAmount = ETHBalance.sub(gasFee); // 减去预估的手续费
    bridgeAmount = bridgeAmount.sub(floatToFixed(0, 18)); // 减去预留的ETH数量
    console.log('开始从主网将ETH转入Mode网络，转入数量：', fixedToFloat(bridgeAmount, 18))
    const modeBridge = new ModeBridge(wallet);
    const tx = await modeBridge.bridgeETHToMode(bridgeAmount);
    console.log(`跨链成功 tx: ${tx.transactionHash}`);
};