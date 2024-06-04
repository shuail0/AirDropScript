/**
 * tasks106: 测试币购买程序  
 * 1. 列表中所有账户的ETH余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 用转出链的ETH购买范围内的sepolia链的GETH。
 * 4. 账户需要有至少0.001ETH的余额，用于支付gas费用，如果余额不足，跳过该账户。
 * 5. 将购买的GETH转到Eclipse测试网
 * 
 */

const TestBridge = require('../protocol/layerzero/bridge/testnetbridge/testbridge.js')
const EclipseTestNetBridge = require('../protocol/eclipse/bridge/eclipseTestNetBridge/eclipseTestNetBridge.js')
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');

const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require("../base/utils.js");

module.exports = async (params) => {
    let { pky, solanaAddress } = params;
    const chains = ['Arbitrum', 'Optimism']; // 配置链信息
    // // 设定随机的ETH数量
    const minAmount = 0.0001  // 最小交易数量
    const maxAmount = 0.0002 // 最大交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
    // let amount = floatToFixed(0.0001);

    const reseveAmount = floatToFixed(0.001, 18); // 账户需要有至少0.001ETH的余额，用于支付gas费用，如果余额不足，跳过该账户。
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
    // 检查余额是否足够
    if (walletInfo[maxChain].balance.lt(reseveAmount)) {
        // console.log('余额低于保留金额，跳过该账户');
        throw new Error('余额余额过低');
    }
    // 选择Sepolia链作为目标链
    let randomChain = 'Sepolia';
    console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].balance, 18), '目标链: ', randomChain, ' 交易金额:', fixedToFloat(amount, 18), ' 开始跨链.');

    // 开始跨链
    const testBridge = new TestBridge();
    const tx = await testBridge.swapAndBridge(walletInfo[maxChain].wallet, maxChain, randomChain, amount);
    console.log('交易成功, tx:', tx.transactionHash, '休息2分钟后跨链至测试网.');

    await sleep(2);

    // 跨链至测试网
    const testNetWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Sepolia']));
    const randomBridgeAmount = floatToFixed(getRandomFloat(0.4, 0.8, 4));
    const fee = floatToFixed(0.000001, 18);
    const testTokenBalance = await testNetWallet.getBalance();
    if (testTokenBalance.lt(randomBridgeAmount.add(fee))) {
        // console.log('余额低于保留金额，跳过该账户');
        throw new Error('测试币余额过低');
    }
    console.log('测试网余额:', fixedToFloat(testTokenBalance, 18),'开始跨链至Eclipse测试网, 交易金额:', fixedToFloat(randomBridgeAmount, 18), 'fee:', fixedToFloat(fee, 18));
    const eclipseTestNetBridge = new EclipseTestNetBridge(testNetWallet);
    await eclipseTestNetBridge.swapAndBridge(solanaAddress, randomBridgeAmount, fee);

};