
/**
 *  项目名称： Overnight
 * 项目链接：https://app.overnight.fi/stats
 * 项目文档：https://docs.overnight.fi/
 * GitHub：https://github.com/ovnstable
 * 已完成功能： mint, redeem   
 * 
 */
const path = require('path');
const ethers = require('ethers');
const { getContract,floatToFixed } = require('../../../../base/utils');


class Overnight {
    constructor(){
        this.exchangeAddr = '0x84d05333f1F5Bf1358c3f63A113B1953C427925D';

        this.exchangeAbi = require('./abi/exchange.json');


        
    };

    async getExchange(wallet, exchangeAddr=this.exchangeAddr, exchangeAbi=this.exchangeAbi){
        return getContract(exchangeAddr, exchangeAbi, wallet);
    };

    async mint(wallet, token, amount) {
        const exchange = await this.getExchange(wallet);
        const mintParams = {
            asset: token,
            amount: amount,
            referral: floatToFixed(0)
        };
        const response = await exchange.mint(mintParams);
        return await response.wait();
    };

    async redeem(wallet, token, amount) {
        const exchange = await this.getExchange(wallet);
        const params = {
            gasPrice: await wallet.getGasPrice(),
            gasLimit: await exchange.estimateGas.redeem(token, amount)
        }
        const response = await exchange.redeem(token, amount, params);
        return await response.wait();
    }
 };

module.exports = Overnight;