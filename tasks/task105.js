/**
 * tasks101: stargate USDC跨链程序  
 * 1. 列表中所有账户的USDC余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 随机选一个链，作为目标链
 * 4. 计算跨链金额,其余的全部跨链至目标链
 * 
 */

const Stone = require('../protocol/layerzero/bridge/stone/stone.js');
const { multExchangeWithdraw } = require('../protocol/cex/multiExchangeWithdraw.js');
const AperTure = require('../protocol/manta/dex/aperture/aperture.js');
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
    const chains = ['Manta', 'Mode']; // 配置链信息
    const modeWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Mode']));
    const mantaWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Manta']));

    const MantaStone = await fetchToken(tokenAddresss['Manta']['STONE'], mantaWallet);
    const MantaWETH = await fetchToken(tokenAddresss['Manta']['wETH'], mantaWallet);
    const MantaUSDC = await fetchToken(tokenAddresss['Manta']['USDC'], mantaWallet);
    console.log('MantaStone:', MantaStone.address, 'MantaWETH:', MantaWETH.address);

    // // 1. 提币
    // console.log('开始提币')
    // await multExchangeWithdraw(params);
    // let sleepTime = getRandomFloat(10, 15)
    // console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    // await sleep(sleepTime);  // 等待10分钟

    const amount = 0.0001; // 随机交易金额
    // 2. 买入Stone
    // 检查账户余额
    while (true) {
        try {
            const ethBalance = await mantaWallet.getBalance();
            if (ethBalance.lt(floatToFixed(amount))) { // 如果账户余额小于1个ETH
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额小于', amount, 'ETH， 等待5分钟后再次查询；');
                await sleep(5);
            } else {
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额大于', amount, 'ETH， 程序继续运行；');
                break;
            };

        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };

    // 3. 刷跨链

    // 4. 卖出Stone

    // 5. 充值

    const aperture = new AperTure(mantaWallet);
    // const tx = await aperture.swapEthToToken(MantaWETH.address, MantaStone.address, 500, amount);
    // console.log('tx:', tx.transactionHash);

    // const mtStoneBalance = await getErc20Balance(mantaWallet, MantaStone.address);
    // console.log('mtStoneBalance:', fixedToFloat(mtStoneBalance, MantaStone.decimal));

    // const tx = await aperture.swapTokenToEth(MantaStone.address, MantaWETH.address, 500, mtStoneBalance);
    // console.log('tx:', tx.transactionHash);





    // const stone = new Stone();

    // let walletInfo = {};
    // let STONE, StoneBalance;
    // // // 遍历所有链
    // for (let i = 0; i < chains.length; i++) {
    //     const chain = chains[i];
    //     const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
    //     STONE = await fetchToken(tokenAddresss[chain]['STONE'], wallet);
    //     StoneBalance = await getErc20Balance(wallet, STONE.address);
    //     walletInfo[chain] = { wallet, StoneBalance, tokenInfo: STONE };
    //     console.log('chain: ', chain, 'StoneBalance:', fixedToFloat(StoneBalance, STONE.decimal));
    // }
    // // // 找出余额最多的链
    // let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].StoneBalance.gte(walletInfo[b].StoneBalance) ? a : b);
    // console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].StoneBalance, walletInfo[maxChain].tokenInfo.decimal));
    // // // // 随机跨链金额
    // let amount = walletInfo[maxChain].StoneBalance;
    // console.log('随机跨链金额: ', fixedToFloat(amount), ' 开始跨链.');

    //     // // 随机选一个链
    // // 创建一个不包含 maxKey 的所有键的数组
    // let keysWithoutMax = Object.keys(walletInfo).filter(key => key !== maxChain);
    // // 从剩余的键中随机选择一个
    // let randomChain = keysWithoutMax[Math.floor(Math.random() * keysWithoutMax.length)];
    // console.log('开始跨链，从', maxChain, '跨链至', randomChain, '金额:', fixedToFloat(amount, walletInfo[maxChain].tokenInfo.decimal));
    // tx = await stone.bridgeStone(walletInfo[maxChain].wallet, maxChain, randomChain, amount);

    // console.log('跨链成功tx:', tx.transactionHash)


};