/**
 * tasks101: Stone跨链程序  
 * 1. 从交易所提ETH至Manta链
 * 2. 将ETH兑换为Stone
 * 3. 生成一个随机跨链次数，然后在Manta和Mode链之间跨链，执行一次跨链算一次。
 * 4. 跨链完成后在Manta将Stone兑换为ETH，并充值至交易所。
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = async (params) => {
    const { pky, amount, exchangeAddr } = params;
    const chains = ['Manta', 'Mode']; // 配置链信息
    const modeWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Mode']));
    const mantaWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Manta']));

    const MantaStone = await fetchToken(tokenAddresss['Manta']['STONE'], mantaWallet);
    const MantaWETH = await fetchToken(tokenAddresss['Manta']['wETH'], mantaWallet);

    // 1. 提币
    console.log('开始提币')
    await multExchangeWithdraw(params);
    let sleepTime = getRandomFloat(10, 15)
    console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    await sleep(sleepTime);  // 等待10分钟

    tradingAmount = floatToFixed(amount - 0.002);
    // 2. 买入Stone
    // 检查账户余额
    while (true) {
        try {
            const ethBalance = await mantaWallet.getBalance();
            if (ethBalance.lt(tradingAmount)) { // 如果账户余额小于1个ETH
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额小于', fixedToFloat(tradingAmount), 'ETH， 等待5分钟后再次查询；');
                await sleep(5);
            } else {
                console.log('当前钱包余额:', fixedToFloat(ethBalance), ',账户余额大于', fixedToFloat(tradingAmount), 'ETH， 程序继续运行；');
                break;
            };

        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };

    const aperture = new AperTure(mantaWallet);
    console.log('开始将ETH兑换为Stone,金额:', fixedToFloat(tradingAmount));
    let tx = await aperture.swapEthToToken(MantaWETH.address, MantaStone.address, 500, tradingAmount);
    console.log('tx:', tx.transactionHash);

    const mtStoneBalance = await getErc20Balance(mantaWallet, MantaStone.address);
    console.log('mtStoneBalance:', fixedToFloat(mtStoneBalance, MantaStone.decimal));

    // 3. 刷跨链
    // 循环跨链次数
    const bridgeTimes = getRandomInt(30,60);

    const stone = new Stone();
    // 循环跨链
    for (let i = 0; i < bridgeTimes; i++) {

        console.log('随机总次数:',bridgeTimes,',当前开始第', i + 1, '次跨链');
        let walletInfo = {};
        let STONE, StoneBalance;
        // // 遍历所有链
        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];
            const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
            STONE = await fetchToken(tokenAddresss[chain]['STONE'], wallet);
            StoneBalance = await getErc20Balance(wallet, STONE.address);
            walletInfo[chain] = { wallet, StoneBalance, tokenInfo: STONE };
            console.log('chain: ', chain, 'StoneBalance:', fixedToFloat(StoneBalance, STONE.decimal));
        }
        // // 找出余额最多的链
        let maxChain = Object.keys(walletInfo).reduce((a, b) => walletInfo[a].StoneBalance.gte(walletInfo[b].StoneBalance) ? a : b);
        console.log('余额最大链: ', maxChain, ' balance:', fixedToFloat(walletInfo[maxChain].StoneBalance, walletInfo[maxChain].tokenInfo.decimal));
        // // // 随机跨链金额
        let bridgeAmount = walletInfo[maxChain].StoneBalance;
        console.log('随机跨链金额: ', fixedToFloat(bridgeAmount), ' 开始跨链.');
        // // 随机选一个链
        // 创建一个不包含 maxKey 的所有键的数组
        let keysWithoutMax = Object.keys(walletInfo).filter(key => key !== maxChain);
        // 从剩余的键中随机选择一个
        let randomChain = keysWithoutMax[Math.floor(Math.random() * keysWithoutMax.length)];
        console.log('开始跨链，从', maxChain, '跨链至', randomChain, '金额:', fixedToFloat(bridgeAmount, walletInfo[maxChain].tokenInfo.decimal));
        let bridgetx = await stone.bridgeStone(walletInfo[maxChain].wallet, maxChain, randomChain, bridgeAmount);
        console.log('跨链成功tx:', bridgetx.transactionHash)
        let sleepTime = getRandomFloat(3, 5);
        console.log('随机暂停：', sleepTime, '分钟');
        await sleep(sleepTime);

    }



    // 4. 卖出Stone

    // 查询MantaStone余额
    let MantaStoneBalance = await getErc20Balance(mantaWallet, MantaStone.address);
    console.log('MantaStone余额:', fixedToFloat(MantaStoneBalance, MantaStone.decimal));
    // 如果余额小于0,则查询ModeStone余额并跨链
    if (MantaStoneBalance.lte(0)) {
        const ModeStone = await fetchToken(tokenAddresss['Mode']['STONE'], modeWallet);
        const ModeStoneBalance = await getErc20Balance(modeWallet, ModeStone.address);
        console.log('ModeStone余额:', fixedToFloat(ModeStoneBalance, ModeStone.decimal));
        if (ModeStoneBalance.gt(0)) {
            console.log('开始跨链，从Mode跨链至Manta,金额:', fixedToFloat(ModeStoneBalance, ModeStone.decimal));
            const stone = new Stone();
            const tx = await stone.bridgeStone(modeWallet, 'Mode', 'Manta', ModeStoneBalance);
            console.log('跨链成功tx:', tx.transactionHash)
            await sleep(2);
            MantaStoneBalance = await getErc20Balance(mantaWallet, MantaStone.address);
        } else if (ModeStoneBalance.lte(0) && MantaStoneBalance.lte(0)){
            // 抛出异常
            throw new Error('Mode 和 Manta Stone余额均为0，无法继续运行程序');
        }
    }

    if (MantaStoneBalance.gt(0)) {
        console.log('将MantaStone兑换为MantaETH,金额:', fixedToFloat(MantaStoneBalance, MantaStone.decimal));
        await checkApprove(mantaWallet, MantaStone.address, aperture.swapRouterAddr, MantaStoneBalance);
        let tx = await aperture.swapTokenToEth(MantaStone.address, MantaWETH.address, 500, MantaStoneBalance);
        console.log('tx:', tx.transactionHash);
        // 5. 充值
        // 查询manta ETH余额
        const mantaEthBalance = await mantaWallet.getBalance();
        console.log('MantaETH余额:', fixedToFloat(mantaEthBalance));
        // 转账金额为余额 - 0.0001ETH
        let transferAmount = mantaEthBalance.sub(floatToFixed(0.0001));
        console.log('开始将ETH转回交易所，金额:', fixedToFloat(transferAmount));
        tx = await mantaWallet.sendTransaction({
            to: exchangeAddr,
            value: transferAmount
        });
        console.log('tx:', tx.hash);

    }


};