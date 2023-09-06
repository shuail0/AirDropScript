const JediSwap = require('../protocol/starknet/dex/jediswap/jediswap');
const {Provider, Account, constants, Contract, num} = require('starknet');
const {getContract, strToFelt, strToHex, feltToStr, feltToInt, floatToUint256, multiCallContract, uint256ToBigInt, multiplyBigIntByFraction, addSecondsToCurrentTimestamp} = require('../base/stkUtils.js');
const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });

// 使用私钥连接钱包
const address = '0x066666940329073d9DD0669d274a4d0870C07192D49f714B9a4ac294F3c3f0b3';
const privatekey = '0xd257a7aeef2ca8d9a8ab322f9761cdcb3c13e44952b71f0e469806cf32dda1';
const account = new Account(provider, address, privatekey);


// 连接erc20token
const ethAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const usdcAddr = '0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';

const zkLendMarket = '0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05';


;(async ()=>{
    const amount = 0.0001
    const amountUint256 = floatToUint256(amount);
    const amountBigInt = uint256ToBigInt(amountUint256);
    const jediswap = new JediSwap();
    // 测试swap
    const tx = await jediswap.swapTokenToToken(account, ethAddr, usdcAddr, amountUint256);
    // console.log(tx)





    // const sum = amountBigInt * BigInt(0.98)

    // const product = multiplyBigIntByFraction(amountBigInt, 0.98)
    // console.log(product);
    // floatToUint256(feltToInt(debt.debt))


    // console.log(addSecondsToCurrentTimestamp(360))

})()
