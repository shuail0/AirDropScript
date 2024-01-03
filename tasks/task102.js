/**
 * tasks102: CoreBridge跨链程序  
 * 1. 列表中所有账户的NativeUSDC余额信息
 * 2. 找出余额最多的链，作为转出链，跨链至CoreDao
 * 3. 如果余额不足，从UniSwap中买入0.0001ETH的USDC
 * 
 */


const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, getRandomFloat } = require("../base/utils.js");
const CoreBridge = require('../protocol/layerzero/bridge/corebridge/corebridge.js');
const UniSwap = require("../protocol/ethereum/dex/uniswap/uniswap.js");
const { getErc20Balance, fetchToken, checkApprove } = require("../base/coin/token.js");
const tokenAddresss = require('../config/tokenAddress.json');


module.exports = async (params) => {
    const { pky } = params;
    // const chains = ['Arbitrum', 'Optimism']; // 配置链信息
    const chains = ['Optimism']; // 配置链信息

    // // 设定随机的ETH数量
    const minAmount = 0.01  // 最小交易数量
    const maxAmount = 0.1 // 最大交易数量

    let walletInfo = {};
    // // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        const USDC = await fetchToken(tokenAddresss[chain]['NativeUSDC'], wallet);
        const USDCBalance = await getErc20Balance(wallet, USDC.address);
        const ETHbalance = await wallet.getBalance();
        walletInfo[chain] = { wallet, ETHbalance, USDCBalance, tokenInfo: USDC };
        console.log('chain: ', chain, ' ETHbalance:', fixedToFloat(ETHbalance, 18), 'USDCBalance:', fixedToFloat(USDCBalance, USDC.decimal));
    }
    // // 找出余额最多的链
    let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].USDCBalance.gte(walletInfo[b].USDCBalance) ? a : b);
    console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].USDCBalance, walletInfo[maxChain].tokenInfo.decimal));
    // // 随机跨链金额
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount, walletInfo[maxChain].tokenInfo.decimal), walletInfo[maxChain].tokenInfo.decimal);
    console.log('随机跨链金额: ', amount, ' 开始跨链.');
    // 检查余额是否足够
    if (walletInfo[maxChain].USDCBalance.lte(amount)) {
        console.log('USDC余额不足， 从UniSwap中买入USDC');
        const uniswap = new UniSwap();
        const WETH = await fetchToken(await uniswap.getWETH9Address(walletInfo[maxChain].wallet), walletInfo[maxChain].tokenInfo.wallet);
        const tx = await uniswap.swapEthToToken(walletInfo[maxChain].wallet, WETH.address, USDC.address, 500, floatToFixed(0.0001, 18));
        console.log('买入成功tx:', tx.transactionHash);
    }

    console.log('账户余额充足开始跨链:', maxChain, '->', 'CoreDao', ' 交易金额:', fixedToFloat(amount, walletInfo[maxChain].tokenInfo.decimal));
    // // 检查授权,并且授权
    const coreBridge = new CoreBridge();
    console.log('开始检查授权');
    await checkApprove(walletInfo[maxChain].wallet, walletInfo[maxChain].tokenInfo.address, coreBridge.contractAddress[maxChain], amount);

    let tx;
    if (maxChain == 'Optimism') {
        tx = await coreBridge.bridge(walletInfo[maxChain].wallet, maxChain, walletInfo[maxChain].tokenInfo.address, amount);

    } else {
        tx = await coreBridge.bridgeERC20(walletInfo[maxChain].wallet, maxChain, walletInfo[maxChain].tokenInfo.address, amount);
    }
    console.log('跨链成功tx:', tx.transactionHash)


};