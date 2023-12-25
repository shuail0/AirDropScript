/**
 * tasks100: stargate ETH跨链程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 随机选一个链，作为目标链
 * 4. 计算跨链金额，保留部分gas，其余的全部跨链至目标链
 * 
 */

const Stargate = require('../protocol/layerzero/bridge/stargate/stargate.js')
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');

const { floatToFixed, fixedToFloat } = require("../base/utils.js");

module.exports = async (params) => {
    const { pky } = params;
    const chains = ['Arbitrum', 'Optimism', 'Base', 'Linea']; // 配置链信息

    const reseveAmount = floatToFixed(0.001, 18); // 保留金额
    let walletInfo = {};
    // 遍历所有链
    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        try {
            const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
            const balance = await wallet.getBalance();
            walletInfo[chain] = { wallet, balance, balanceFloat: fixedToFloat(balance) };
        } catch (error) {

            console.log(`查询${chain} 链失败，跳过此链error: `, error);


        }
    }
    // 找出余额最多的链
    let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].balanceFloat > walletInfo[b].balanceFloat ? a : b);
    console.log('余额最大链: ', maxChain, ' balance:', walletInfo[maxChain].balanceFloat);
    // 随机选一个链
    // 创建一个不包含 maxKey 的所有键的数组
    let keysWithoutMax = Object.keys(walletInfo).filter(key => key !== maxChain);
    // 从剩余的键中随机选择一个
    let randomChain = keysWithoutMax[Math.floor(Math.random() * keysWithoutMax.length)];
    console.log('随机目标链: ', randomChain, ' balance:', walletInfo[randomChain].balanceFloat);

    // 检查余额是否足够
    if (walletInfo[maxChain].balance.lt(reseveAmount)) {
        // console.log('余额低于保留金额，跳过该账户');
        throw new Error('余额低于保留金额，跳过该账户');
    }

    // 计算跨链金额
    const amount = walletInfo[maxChain].balance.sub(reseveAmount);
    console.log('开始跨链，amount: ', amount, ' amountFloat:', fixedToFloat(amount, 18));

    // 开始跨链

    const stargate = new Stargate();
    const tx = await stargate.swapETH(walletInfo[maxChain].wallet, maxChain, randomChain, amount)
    console.log('tx: ', tx.transactionHash);

};