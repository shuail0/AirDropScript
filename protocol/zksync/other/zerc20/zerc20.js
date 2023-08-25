/**
 * 链接： https://zerc20.cash/
 * 
 */

const { getContract,floatToFixed } = require('../../../../base/utils');

class Zerc20 {
    constructor() {

        thix.abi = require('./abi/zerc20.json')

    }

    async mint(wallet, token) {
        const tokenContract = getContract(token, this.abi, wallet);
        const response = await tokenContract.mint(wallet.address);
        return await response.wait();
     };
};

module.exports = Zerc20;