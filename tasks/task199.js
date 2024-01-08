/**
 * tasks8: rhino mintNFT程序
 * 1. 最排名前30%的账户执行mintNFT
 */

const UniSwap = require("../protocol/ethereum/dex/uniswap/uniswap.js");
const { fetchToken, getBalance, tokenApprove } = require("../base/coin/token.js");
const RPC = require('../config/RpcConfig.json');
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require("../base/utils.js");
const ethers = require("ethers");

module.exports = async (params) => {
    const { pky } = params;
    const chains = ['Arbitrum', 'Optimism']; // 配置链信息

    const uniswap = new UniSwap();
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC['Arbitrum']));
    const USDC = await fetchToken('0xaf88d065e77c8cC2239327C5EDb3A432268e5831', wallet);
    const WETH = await fetchToken(await uniswap.getWETH9Address(wallet), wallet);
    console.log('USDC:', USDC);
    console.log('WETH:', WETH);
    const tx = await uniswap.swapEthToToken(wallet, WETH.address, USDC.address, 500,floatToFixed(0.0001, 18));
    console.log('tx:', tx);
};
