

const { getContract, floatToFixed } = require('../../../../base/utils');
const ethers = require('ethers');


class BigInt {
    constructor(){
        this.contractAddr = '0x47247d8bea27ad415a07322708aa09d1b4c99520';
        this.contractAbi = require('./abi/abi.json');
    }
    getBigIntContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     // mint
     async mintNft(wallet,amount=ethers.BigNumber.from(1)){

        const contract = this.getBigIntContract(wallet);

        const params = {
            value: floatToFixed(0.0004)
        }

        const response = await contract.batchMint(amount, params);
        return await response.wait()

    };
}

module.exports = BigInt;


