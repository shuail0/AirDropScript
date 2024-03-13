

const { getContract } = require('../../../../base/utils');

class Gambit {
    constructor(){
        this.contractAddr = '0x0729e806f57CE71dA4464c6B2d313E517f41560b';
        this.contractAbi = require('./abi/gambit.json');
    }
    getGambitContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }


     async depositUsdc(wallet,amount){

        const contract = this.getGambitContract(wallet);
        const assets = amount;
        const receiver = wallet.address;
        const params = {
            gasPrice: await wallet.getGasPrice(),
            gasLimit: await contract.estimateGas.deposit(assets, receiver)
          };
        const response = await contract.deposit(
            assets, 
            receiver,
            params
            );
        return await response.wait()

    };

    async withdrawUsdc(wallet,amount){

        const contract = this.getGambitContract(wallet);
        const params = {
            shares: amount,
            owner: wallet.address
        }

        const response = await contract.withdraw(params);
        return await response.wait()

    }
}

module.exports = Gambit;