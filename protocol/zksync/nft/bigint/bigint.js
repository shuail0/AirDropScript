

const { getContract } = require('../../../../base/utils');
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
            mint: amount
        }

        const response = await contract.batchMint(params);
        return await response.wait()

    };
}

module.exports = BigInt;


