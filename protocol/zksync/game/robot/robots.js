const { getContract } = require('../../../../base/utils');

class robots {
    constructor(){
        this.contractAddr = '0xC91AAacC5adB9763CEB57488CC9ebE52C76A2b05';
        this.contractAbi = require('./abi/ticket.json');
    }
    getRobotsContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     async getTicket(wallet){
        const contract = this.getRobotsContract(wallet);
        const response = await contract.getTicket();
        return await response.wait();

    };
}

module.exports = robots;
