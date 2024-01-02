const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class Basilisk {
    constructor(){
        this.BNativeAddr = '0x1e8F1099a3fe6D2c1A960528394F4fEB8f8A288D'
        this.BNativeAbi = require('./abi/BNative.json');

    }
    async getBNative(wallet, BNativeAddr=this.BNativeAddr, BNativeAbi=this.BNativeAbi) {
        return getContract(BNativeAddr, BNativeAbi, wallet);
    };

    async deposit(wallet, amount) {
        const BNative = await this.getBNative(wallet);
        const params = {
            value:amount
        };

        const response = await BNative.mint(
            params
        );
        return await response.wait();
    }

    async withdraw(wallet, amount) {
        const BNative = await this.getBNative(wallet);
        const response = await BNative.redeem(
            amount
        );
        return await response.wait();
    }
}

module.exports = Basilisk;
