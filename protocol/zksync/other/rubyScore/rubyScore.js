const { getContract } = require('../../../../base/utils');

class rubyScore {
    constructor(){
        this.contractAddr = '0xcb84d512f0c9943d3bc6b4be8801ac8aa6621a54';
        this.contractAbi = require('./abi/vote.json');

        this.rubyScoreContract = getContract(this.contractAddr, this.contractAbi);

    }
    getRubyScoreContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     // vote
    async vote(wallet){
        const contract = this.getRubyScoreContract(wallet);
        const response = await contract.vote();
        return await response.wait()
    }
}

module.exports = rubyScore;