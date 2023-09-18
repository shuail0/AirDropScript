const JediSwap = require('../protocol/starknet/dex/jediswap/jediswap');
const {Provider, Account, constants, Contract, num, cairo, RpcProvider} = require('starknet');
const { floatToFixed} = require('../base/utils');
const {getContract, strToFelt, strToHex, feltToStr, feltToInt, floatToUint256, multiCallContract, uint256ToBigInt, multiplyBigIntByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256} = require('../base/stkUtils.js');
const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/kxngzU4tlSqGotz30twQ9E6n4876XMZz'});


// 使用私钥连接钱包
const address = '0x066666940329073d9DD0669d274a4d0870C07192D49f714B9a4ac294F3c3f0b3';
const privatekey = '0xd257a7aeef2ca8d9a8ab322f9761cdcb3c13e44952b71f0e469806cf32dda1';
const account = new Account(provider, address, privatekey, '1');


// 连接erc20token
const ethAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const usdcAddr = '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';

;(async ()=>{

    const jediswap = new JediSwap();
    // 测试swap
    const amount = floatToFixed(0.0001);
    const tx = await jediswap.swapTokenToToken(account, ethAddr, usdcAddr, amount);
    console.log(tx)

    // 查询token0和token1
    // const tokeninfo = await jediswap.getToken0andToek1Addr(account, ethAddr, usdcAddr);
    // console.log(tokeninfo)

    // 查询pair资产储备
    // const pairInfo = await jediswap.getPairInfo(account, ethAddr, usdcAddr);
    // console.log(pairInfo);



    // 测试预估返回代币数量（用于组LP
    // const amount = floatToFixed(1,6)
    // const amountOut = await jediswap.getQuote(account, usdcAddr, ethAddr, amount);
    // console.log(amountOut)

    // 测试添加流动性
    // const amountA =  floatToFixed(0.000612494);
    // const amountB = floatToFixed(1, 6);
    // const tx = await jediswap.addLiquidityToPool(account, ethAddr,usdcAddr,amountA, amountB)
    // console.log(tx);


    // 测试获取Pair
    // const pair = await jediswap.getPair(account, ethAddr, usdcAddr);
    // console.log(pair);

    // 测试获取LP余额
    // const lpBalance = await jediswap.getLPBalance(account, ethAddr, usdcAddr);
    // console.log(lpBalance)

    // 测试移除流动性
    // const tx = await jediswap.removeLiquidityForPool(account, ethAddr, usdcAddr);
    // console.log(tx);

})()
