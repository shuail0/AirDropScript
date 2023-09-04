/**
 * starknet 跨链程序：将ETH从主网跨链至starknet网络中
 * 1. 查询账户余额
 * 2. 扣除GAS和手续费
 * 3. 将账户所有的ETH跨链至starknet网络
 */


const {StkBridges} = require('../protocol/starknet/crosschain/stkbridges');
const { BigNumber, Wallet, providers, utils } = require('ethers');
const { floatToFixed } = require('../base/utils');

module.exports = async (wallet, starknetAddr) => {
    // 查询账户ETH余额
    const ethBalance = await wallet.getBalance();

    // 计算预留gas
    const gasLimit = BigNumber.from(117855);
    const gasPriceMultiplier = 1.8;
    const gasPrice = parseFloat(utils.formatUnits(await wallet.getGasPrice(), 'gwei'));
    const gasPriceInteger = utils.parseUnits((gasPrice * gasPriceMultiplier).toFixed(4), 'gwei');
    const bridgeGasFee = gasLimit.mul(gasPriceInteger);

    // 计算stk手续费
    const bridge = new StkBridges();
    const payload = [starknetAddr.toLowerCase(), ethBalance, BigNumber.from(0)]
    const stkFee = await bridge.getL1ToL2MessageFee(bridge.ethContractAddr, bridge.stkContractAddr,bridge.stkDepositEntryPointSelector,payload);

    // 计算预留手续费
    const estFee = bridgeGasFee.add(stkFee);
    if (estFee.gt(ethBalance)){
        throw new Error('当前余额小于所需支付的费用');
    }

    // // 计算跨链数量
    const bridgeAmount = ethBalance.sub(estFee);
    console.log('跨链数量:', bridgeAmount, '开始跨链')

    // // 跨链
    const tx = await bridge.depositEth(wallet, bridgeAmount, starknetAddr, stkFee);
    console.log('跨链成功 txHash:', tx.transactionHash);

};


