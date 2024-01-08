/**
 * tasks100: stargate ETH跨链程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 用转出链的ETH购买范围内的goerli链的GETH。
 * 4. 账户需要有至少0.003ETH的余额，用于支付gas费用，如果余额不足，跳过该账户。
 * 
 */

const TestBridge = require('../protocol/layerzero/bridge/testnetbridge/testbridge.js')
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');

const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");

module.exports = async (params) => {
    const { pky } = params;
    const chains = ['Arbitrum', 'Optimism']; // 配置链信息
    // // 设定随机的ETH数量
    const minAmount = 0.0001  // 最小交易数量
    const maxAmount = 0.0002 // 最大交易数量
    // let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    let amount = floatToFixed(0.0001);

    const reseveAmount = floatToFixed(0.003, 18); // 账户需要有至少0.003ETH的余额，用于支付gas费用，如果余额不足，跳过该账户。
    let walletInfo = {};
    // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        const balance = await wallet.getBalance();
        walletInfo[chain] = { wallet, balance };
        console.log('chain: ', chain, ' balance:', fixedToFloat(balance, 18));
    }
    // 找出余额最多的链
    let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].balance.gte(walletInfo[b].balance) ? a : b);
    console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].balance, 18));
    // 检查余额是否足够
    if (walletInfo[maxChain].balance.lt(reseveAmount)) {
        // console.log('余额低于保留金额，跳过该账户');
        throw new Error('余额低于保留金额，跳过该账户');
    }
    // 选择goerli链作为目标链
    let randomChain = 'Goerli';
    console.log('目标链: ', randomChain, ' 交易金额:', fixedToFloat(amount, 18), ' 开始跨链.');

    // 开始跨链
    const testBridge = new TestBridge();
    const tx = await testBridge.swapAndBridge(walletInfo[maxChain].wallet, maxChain, randomChain, amount);
    console.log('tx:', tx )

};