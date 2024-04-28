/* 
    ETH主网充值到交易所地址
        1. 从ETH主网钱包地址提币到交易所地址
*/

const { floatToFixed, fixedToFloat } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');

module.exports = async (params) => {
    
        const {pky,exchangeAddr} = params;
        const provider = new ethers.providers.JsonRpcProvider(RPC.Ethereum);
        const wallet = new ethers.Wallet(pky, provider);
        const ethBalance = await wallet.getBalance();
        ethers.logger.info('ETH余额:', fixedToFloat(ethBalance), '开始转账');
        const transferAmount = ethBalance.sub(ethers.utils.parseEther("0.0045"));
        const tx = await wallet.sendTransaction({
            to: exchangeAddr,
            value: transferAmount
        });
        await tx.wait();
        ethers.logger.info('转账成功，tx:', tx.hash);
    }

