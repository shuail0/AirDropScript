const { getContract } = require('../../../../base/utils');

class chainPray {
    constructor(){
        this.contractAddr = '0xf85d532b54b27f9dde35d2f94320cec97a14cfd2';
        this.contractAbi = require('./abi/abi.json');
        this.chainPrayContract = getContract(this.contractAddr, this.contractAbi);
    }
    getChainPrayContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
        }
    

     // MINT
    async mint(wallet){
        const contract = this.getChainPrayContract(wallet);
        const response = await contract.dailyMint();
        return await response.wait()
    }
}

module.exports = chainPray;