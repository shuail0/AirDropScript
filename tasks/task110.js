/**
 * tasks101: stargate USDC跨链程序  
 * 1. 列表中所有账户的USDC余额信息
 * 2. 找出余额最多的链，作为转出链
 * 3. 随机选一个链，作为目标链
 * 4. 计算跨链金额,其余的全部跨链至目标链
 * 
 */

const Stargate = require('../protocol/layerzero/bridge/stargate/stargate.js')
const { fetchToken, getErc20Balance, checkApprove, tokenTransfer, tokenTrasfer } = require("../base/coin/token.js");
const { multExchangeWithdraw } = require('../protocol/cex/multiExchangeWithdraw.js');
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const tokenAddresss = require('../config/tokenAddress.json');

const {
    floatToFixed,
    fixedToFloat,
    getRandomFloat,
    sleep,
} = require("../base/utils.js");
const { pro } = require('ccxt');

module.exports = async (params) => {
    const { pky, exchangeAddr } = params;


    const withdrawChainInfo = {
        Arbitrum: 'ARBITRUM',
        BSC: 'BSC',
        Fantom: 'FTM',
        Avalanche: 'AVAXC'
    }
    const stargate = new Stargate();
    const tokenName = 'STG'; // 要跨链的token
    // const chains = ['Ethereum','BSC','Avalanche','Polygon','Arbitrum','Optimism','Fantom','Metis','Base','Linea','Kava','Mantle']; // 配置链信息
    const path0 = ['Arbitrum', 'Optimism', 'Base', 'Fantom', 'Avalanche', 'Kava', 'BSC']; // 配置链信息
    const path1 = ['BSC', 'Arbitrum', 'Optimism', 'Avalanche', 'Base', 'Kava', 'Fantom']; // 配置链信息
    const path2 = ['Fantom', 'Arbitrum', 'Kava', 'Optimism', 'BSC', 'Base', 'Avalanche']; // 配置链信息
    const path3 = ['Avalanche', 'Kava', 'Optimism', 'BSC', 'Base', 'Fantom', 'Arbitrum']; // 配置链信息

    const bridgePaths = [path0, path1, path2, path3];
    // 随机从chains中选一个
    const bridgePath = bridgePaths[Math.floor(Math.random() * bridgePaths.length)];
    console.log('bridgePath: ', bridgePath);
    params.chain = withdrawChainInfo[bridgePath[0]]

    // 1. 提币
    console.log('开始提币')
    await multExchangeWithdraw(params);
    let sleepTime = getRandomFloat(10, 15)
    console.log(`提币成功，等待${sleepTime}分钟后查询钱包余额;`)
    await sleep(sleepTime);  // 等待10分钟

    for (let i = 0; i < bridgePath.length; i++) {
        const fromChain = bridgePath[i];
        const toChain = bridgePath[i + 1];
        // 查询fromChain的STG余额
        const fromChainWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[fromChain]));
        const fromChainSTG = await fetchToken(tokenAddresss[fromChain][tokenName], fromChainWallet);
        // 检查账户余额
        let STGBalance;
        while (true) {
            try {
                STGBalance = await getErc20Balance(fromChainWallet, fromChainSTG.address);
                console.log(`${fromChain} STG Balance`, fixedToFloat(STGBalance, fromChainSTG.decimal));
                if (STGBalance.lt(floatToFixed(1))) { // 如果账户余额小于1个ETH
                    console.log('当前钱包余额:', fixedToFloat(STGBalance), ',账户余额小于', 1, 'STG, 等待5分钟后再次查询;');
                    await sleep(5);
                } else {
                    console.log('当前钱包余额:', fixedToFloat(STGBalance), ',账户余额大于', 1, 'ETH, 程序继续运行；');
                    break;
                };

            } catch (error) {
                console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
                await sleep(0.5);
            };
        };
        if (!toChain) {
            break;
        }
        console.log(`开始从${fromChain}跨链至${toChain}`);
        const Wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[fromChain]));
        const STGInfo = await fetchToken(tokenAddresss[fromChain][tokenName], Wallet);
        console.log(`${fromChain} STG Balance`, fixedToFloat(STGBalance, STGInfo.decimal));
        console.log(`开始从${fromChain}跨链至${toChain}, 跨链金额为${fixedToFloat(STGBalance, STGInfo.decimal)}`);
        // // // 开始跨链
        const tx = await stargate.sendSTG(Wallet, STGInfo.address, toChain, STGBalance)
        console.log('跨链成功 tx: ', tx.transactionHash);
        if (i < bridgePath.length - 1) {
            // 随机暂停10-20分钟
            let sleepTime = getRandomFloat(1, 2);
            console.log(`等待${sleepTime}分钟后继续;`);
            await sleep(sleepTime);
        }
    }
    console.log('跨链完成');

    // 选出bridgePath的最后一个链
    const lastChain = bridgePath[bridgePath.length - 1];
    // 检查最后一个链的STG余额
    const lastChainWallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[lastChain]));
    const lastChainSTG = await fetchToken(tokenAddresss[lastChain][tokenName], lastChainWallet);
    let lastChainSTGBalance;
    while (true) {
        try {
            lastChainSTGBalance = await getErc20Balance(lastChainWallet, lastChainSTG.address);
            console.log(`${lastChain} STG Balance`, fixedToFloat(lastChainSTGBalance, lastChainSTG.decimal));
            if (lastChainSTGBalance.lt(floatToFixed(1))) { // 如果账户余额小于1个ETH
                console.log('当前钱包余额:', fixedToFloat(lastChainSTGBalance), ',账户余额小于', 1, 'STG, 等待2分钟后再次查询;');
                await sleep(2);
            } else {
                console.log('当前钱包余额:', fixedToFloat(lastChainSTGBalance), ',账户余额大于', 1, 'ETH, 程序继续运行；');
                break;
            };

        } catch (error) {
            console.log('获取余额失败,暂停30秒后重试，错误信息：', error);
            await sleep(0.5);
        };
    };
    console.log('将余额充值至交易所, 余额:', fixedToFloat(lastChainSTGBalance, lastChainSTG.decimal));
    const tx = await tokenTransfer(lastChainWallet, lastChainSTG.address, lastChainSTGBalance, exchangeAddr);
    console.log('充值成功 tx:', tx.transactionHash);

};