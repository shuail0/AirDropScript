/**
 *  项目名称： tarot Finance
 * 项目链接：https://www.tarot.to/
 * 项目文档：https://docs.tarot.to/
 * GitHub：https://github.com/tarot-finance
 * 已完成功能： supperETH, withdraw
 *
 */
const path = require("path");
const ethers = require("ethers");
const { getContract, floatToFixed } = require("../../../../base/utils");

class Tarot {
  constructor() {
    this.routerAddr = "0x61bB845A4797A6DDD2baE9F0926A2019D7556AAD";
    this.routerAbi = require("./abi/router.json");
  }

  async getRouter(
    wallet,
    routerAddr = this.routerAddr,
    routerAbi = this.routerAbi
  ) {
    return getContract(routerAddr, routerAbi, wallet);
  }

  async supplyEth(wallet, poolToken, amount) {
    const router = await this.getRouter(wallet);
    const response = await router.mintETH(
      poolToken,
      wallet.address,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      { value: amount }
    );
    return await response.wait();
  }

  async withdrawEth(wallet, poolToken, amount, permitData = "0x") {
    const router = await this.getRouter(wallet);
    const response = await router.redeemETH(
      poolToken,
      amount,
      wallet.address,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      permitData
    );
    return await response.wait();
  }
  
  async getLendingPool(wallet, underlyingAssetPool) {
    const router = await this.getRouter(wallet);
    const response = await router.getLendingPool(underlyingAssetPool);
    return response;
  }

}

module.exports = Tarot;
