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
        const response = await exchange.redeem(token, amount);
        return await response.wait();
    }
 };

module.exports = Overnight;