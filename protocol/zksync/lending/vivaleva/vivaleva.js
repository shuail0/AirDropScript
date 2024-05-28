const { Wallet } = require('ethers');
const { getContract } = require('../../../../base/utils');

class VivaLeva {
    constructor(){
        this.ibETHAddr = '0x23FDd6487a17abB8360E8Da8b1B370C94ee94Cc2'
        this.Abi = require('./abi/abi.json');
    }
    async getibETHContract(wallet, ibETHAddr=this.ibETHAddr, Abi=this.Abi) {
        return getContract(ibETHAddr, Abi, wallet);
    };

    async deposit(wallet, amount) {
        const ibETHContract = await this.getibETHContract(wallet);
        const response = await ibETHContract.deposit(amount);
        return await response.wait();
    }
}

module.exports = VivaLeva;