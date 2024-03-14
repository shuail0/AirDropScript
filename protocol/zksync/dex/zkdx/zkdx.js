
const { getContract } = require('../../../../base/utils');

class Zkdx {
    constructor(){
        this.contractAddr = '0x7455eb101303877511d73c5841fbb088801f9b12';
        this.contractAbi = require('./abi/fUsdt.json');

        this.zkdxContract = getContract(this.contractAddr, this.contractAbi);

    }
    getZkdxContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     // mint fUsdt
    async mintFUsdt(wallet){
        const contract = this.getZkdxContract(wallet);
        const response = await contract.faucet();
        return await response.wait()
    }
};

module.exports = Zkdx;