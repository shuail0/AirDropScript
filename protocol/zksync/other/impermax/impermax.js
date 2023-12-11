/**
 *  项目名称： Impermax Finance
 * 项目链接：https://www.impermax.finance/
 * 项目文档：https://docs.impermax.finance/
 * GitHub：https://github.com/Impermax-Finance
 * 已完成功能： supperETH, withdraw
 *
 */
const path = require("path");
const ethers = require("ethers");
const { getContract, floatToFixed } = require("../../../../base/utils");

class Impermax {
  constructor() {
    this.routerAddr = "0x0463cdFc586c36CCD0E2510acECE24bdac354324";
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

module.exports = Impermax;
