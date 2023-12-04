/**
 * 链接： https://zerc20.cash/
 * 已完成功能： mint
 */

const { getContract,floatToFixed } = require('../../../../base/utils');

class Zerc20 {
    constructor() {

        this.abi = require('./abi/zerc20.json');

    }

    async mint(wallet, token, value) {
        const tokenContract = getContract(token, this.abi, wallet);
        const params = {value: floatToFixed(value)};
        const response = await tokenContract.mint(wallet.address, params);
        return await response.wait();
     };
};

module.exports = Zerc20;