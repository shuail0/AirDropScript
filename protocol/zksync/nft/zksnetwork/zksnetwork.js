/**
 *  项目名称： zksNetwork
 * 项目链接：https://zks.network/
 * 项目文档：
 * GitHub：
 * 已完成功能： registerDomain, isDomainAvailable   
 * 
 */

const { getContract } = require('../../../../base/utils');

class ZksNetwork {
    constructor(){
        this.contractAddr = '0xCBE2093030F485adAaf5b61deb4D9cA8ADEAE509';
        this.contractAbi = require('./abi/zksnetwork.json');
    }
    getZknetworkContract(wallet, contractAddr=this.contractAddr, contractAbi=this.contractAbi){
        return getContract(contractAddr, contractAbi, wallet);
     }

     // 检查域名是否可用
     async isDomainAvailable(wallet, domain){
        const contract = this.getZknetworkContract(wallet);
        return await contract.available(domain);
    };
    
    // 注册域名
    async registerDomain(wallet, domain, yearCount=1){
        const contract = this.getZknetworkContract(wallet);
        const response = await contract.register(domain, wallet.address, yearCount);
        return await response.wait()
     };

};

module.exports = ZksNetwork;