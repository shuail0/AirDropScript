const { Wallet } = require('ethers');
const { getContract } = require('../../../../base/utils');

class Veno {
    constructor(){
        this.ProxyAddr = '0xE7895ed01a1a6AAcF1c2E955aF14E7cf612E7F9d'
        this.VenoAbi = require('./abi/LiquidEth.json');
    }
    async getProxyContract(wallet, ProxyAddr=this.ProxyAddr, VenoAbi=this.VenoAbi) {
        return getContract(ProxyAddr, VenoAbi, wallet);
    };

    async stake(wallet, amount) {
        const Proxy = await this.getProxyContract(wallet);
        const params = {
            value:amount
        };

        const response = await Proxy.stake(
            wallet.address,
            params
            
            
        );
        return await response.wait();
    }
}

module.exports = Veno;