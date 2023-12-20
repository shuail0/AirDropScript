/**
 * tasks101: stargate USDC跨链程序  
 * 1. 列表中所有账户的USDC余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 随机选一个链，作为目标链
 * 4. 计算跨链金额,其余的全部跨链至目标链
 * 
 */

const Stargate = require('../protocol/layerzero/bridge/stargate/stargate.js')
const { fetchToken, getErc20Balance, checkApprove } = require("../base/coin/token.js");
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const tokenAddresss = require('../config/tokenAddress.json');

const {
    floatToFixed,
    fixedToFloat,
    getRandomFloat,
    sleep,
} = require("../base/utils.js");

module.exports = async (params) => {
    const { pky } = params;
    // const chains = ['Ethereum','BSC','Avalanche','Polygon','Arbitrum','Optimism','Fantom','Metis','Base','Linea','Kava','Mantle']; // 配置链信息
    const chains = ['Polygon','Arbitrum','Optimism','Fantom']; // 配置链信息
    const tokenName = 'USDC'; // 要跨链的token

    

    // const reseveAmount = floatToFixed(0.001, 18); // 保留金额
    let walletInfo = {};
    // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        const tokenInfo = await fetchToken(tokenAddresss[chain][tokenName],wallet);
        const balance = await getErc20Balance(wallet, tokenInfo.address);
        console.log('chain: ', chain, ' balance:', fixedToFloat(balance, tokenInfo.decimal));
        walletInfo[chain] = { wallet, tokenInfo, balance };
    }
    // 找出余额最多的链
    let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].balance.gte(walletInfo[b].balance) ? a : b);
    console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].balance, walletInfo[maxChain].tokenInfo.decimal));

    // // 随机选一个链
    // 创建一个不包含 maxKey 的所有键的数组
    let keysWithoutMax = Object.keys(walletInfo).filter(key => key !== maxChain);
    // 从剩余的键中随机选择一个
    let randomChain = keysWithoutMax[Math.floor(Math.random() * keysWithoutMax.length)];
    console.log('随机目标链: ', randomChain, ' balance:', fixedToFloat(walletInfo[randomChain].balance, walletInfo[randomChain].tokenInfo.decimal));

    // 计算跨链金额
    const amount = walletInfo[maxChain].balance;
    console.log('开始跨链，amount: ', amount, ' amountFloat:', fixedToFloat(amount, walletInfo[maxChain].tokenInfo.decimal));

    const stargate = new Stargate();
    // // 检查授权,并且授权
    console.log('开始检查授权');
    await checkApprove(walletInfo[maxChain].wallet, walletInfo[maxChain].tokenInfo.address, stargate.contractAddress[maxChain].contracts.Router, amount);

    // // 开始跨链

    const tx = await stargate.swap(walletInfo[maxChain].wallet, maxChain, randomChain, walletInfo[maxChain].tokenInfo.symbol, walletInfo[randomChain].tokenInfo.symbol, amount)
    console.log('tx: ', tx.transactionHash);

};