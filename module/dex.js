const {getContract} = require('../base/utils.js');
const ethers = require('ethers');

ethers.Contract
class Dex {
  constructor({
    name,
    provider,
    contracts,
    abis,
    functionname

  }) {
    this.name = name;
    this.provider = provider;
    this.contracts = contracts;
    this.abis = abis;
    this.functionname = functionname;
  }
  async getRouter(wallet, routerAddr=this.contracts.router, routerAbi=this.abis.router, ){
    return getContract(routerAddr, routerAbi, wallet);
  };

  async getFactory(provider=this.provider, factoryAddr=this.contracts.factory, factoryAbi=this.abis.factory){
    return getContract(factoryAddr, factoryAbi, provider);
  };

  // async getPool() {
  //   // Implementation for getPool()
  // }

  // async swapEthToToken() {
  //   // Implementation for swapEthToToken()
  // }

  // async swapTokenToToken() {
  //   // Implementation for swapTokenToToken()
  // }

  // async swapTokenToEth(){
  //  // Implementation for swapTokenToEth() 
  // }

  // async addLiquidityToPool(){};

  // async removeLiquidityOfPool(){};

  

}

module.exports = Dex;
