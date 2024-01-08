/**
 * tasks104: zkBridge跨链程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链，跨链至另一条链
 * 3. 跨链金额随机（0.0001-0.0003ETH）
 * 
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");
const zkBridge = require('../protocol/layerzero/bridge/zkbridge/zkbridge.js');
const UniSwap = require("../protocol/ethereum/dex/uniswap/uniswap.js");
const { getErc20Balance, fetchToken, checkApprove } = require("../base/coin/token.js");
const tokenAddresss = require('../config/tokenAddress.json');
const { pro } = require("ccxt");


module.exports = async (params) => {
    const { pky } = params;
    const chains = ['Arbitrum', 'Optimism']; // 配置链信息
    // // 设定随机的ETH数量
    const minAmount = 0.0001  // 最小交易数量
    const maxAmount = 0.0003 // 最大交易数量

    let walletInfo = {};
    let USDC, USDCBalance, ETHbalance;
    // // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        USDC = await fetchToken(tokenAddresss[chain]['USDC'], wallet);
        USDCBalance = await getErc20Balance(wallet, USDC.address);    
        ETHbalance = await wallet.getBalance();
        walletInfo[chain] = { wallet, ETHbalance, USDCBalance, tokenInfo: USDC };
        console.log('chain: ', chain, ' ETHbalance:', fixedToFloat(ETHbalance, 18), 'USDCBalance:', fixedToFloat(USDCBalance, USDC.decimal));
    }



    // // 找出余额最多的链
    let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].ETHbalance.gte(walletInfo[b].ETHbalance) ? a : b);
    console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].ETHbalance));
    
    // 随机选一个链
    // 创建一个不包含 maxKey 的所有键的数组
    let keysWithoutMax = Object.keys(walletInfo).filter(key => key !== maxChain);
    // 从剩余的键中随机选择一个
    let randomChain = keysWithoutMax[Math.floor(Math.random() * keysWithoutMax.length)];
    console.log('随机目标链: ', randomChain, ' balance:', fixedToFloat(walletInfo[randomChain].ETHbalance));

    // // // // 随机跨链金额
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    console.log('随机跨链金额: ', fixedToFloat(amount), ' 开始跨链.');
    // 检查余额是否足够
    if (walletInfo[maxChain].ETHbalance.lte(amount.add(floatToFixed(0.003)))) {
        console.log('ETH余额低于跨链金额+0.003ETH， 跳过账户');
        throw new Error('ETH余额低于跨链金额+0.003ETH， 跳过账户');
    }

    // 测试跨链费用
    const zkbridge = new zkBridge();
    console.log('账户余额充足开始跨链:', maxChain, '->', randomChain, ' 交易金额:', fixedToFloat(amount));
    const tx = await zkbridge.bridgeETH(walletInfo[maxChain].wallet, maxChain, randomChain, amount);
    console.log('跨链成功tx:', tx.transactionHash)

};