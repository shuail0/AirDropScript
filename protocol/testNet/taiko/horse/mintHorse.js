
const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class MintHorse {
  constructor() {
    this.name = 'mintHorse';
    this.contractAddr = '0xa960d72F83A8A163412520A778b437AC5211A501';
    this.contractAbi = require('./abi/mintHorse.json');
    }

    async getContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi) {
        return getContract(contractAddr, contractAbi, wallet);
    }

    async mintHorse(wallet) {
        const router = await this.getRouter(wallet);
        const address = wallet.address;

        const reponse = await router.mintHorse({
            to: address,
        })
        return await reponse.wait();
    }
}

module.exports = MintHorse;
