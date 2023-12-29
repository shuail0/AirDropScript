const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class XBank {
    constructor(){
        this.XBankAddr = '0xE4622A57Ab8F4168b80015BBA28fA70fb64fa246'
        this.XBankAbi = require('./abi/xbankabi.json');
    }
    async getXBank(wallet, XBankAddr=this.XBankAddr, XBankAbi=this.XBankAbi) {
        return getContract(XBankAddr, XBankAbi, wallet);
    };

    async deposit(wallet, amount) {
        const XBank = await this.getXBank(wallet);
        const params = {
            value:amount
        };

        const response = await XBank.mint(
            params
        );
        return await response.wait();
    }

    async withdraw(wallet, amount) {
        const XBank = await this.getXBank(wallet);
        const response = await XBank.redeem(
            amount
        );
        return await response.wait();
    }
}

module.exports = XBank;