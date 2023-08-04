const path = require('path');
const ethers = require('ethers');
const { defaultAbiCoder } = require('ethers').utils;
// const Dex = require('../../../module/dex.js');
const { getContract } = require(path.resolve(__dirname, '../../../base/utils.js'));

class SyncSwap {
  constructor() {
    this.name = 'SyncSwap';
    this.routerAddr = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295';
    this.factoryAddr = '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb';
    this.routerAbi = require('./abi/SyncSwapRouter.json');
    this.factoryAbi = require('./abi/BasePoolFactory.json');
    this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
  };

  async getPool(wallet, tokenA, tokenB) {
    const classicFactory = await getContract(this.factoryAddr, this.factoryAbi, wallet);
    return await classicFactory.getPool(tokenA, tokenB);
  };
  async getRouter(wallet, routerAddr = this.routerAddr, routerAbi = this.routerAbi) {
    return getContract(routerAddr, routerAbi, wallet);
  };

  async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=0) {
    const router = await this.getRouter(wallet);
    const poolAddr = await this.getPool(wallet, tokenIn, tokenOut)
    // 交易模式：
    // 1 - 提取并解包装到原生ETH
    // 2 - 提取并包装到wETH
    const withdrawMode = 1;
    //  构建交易参数
    const swapData = defaultAbiCoder.encode(
      ["address", "address", "uint8"],
      [tokenIn, wallet.address, withdrawMode]
    )
    const steps = [{
      pool: poolAddr,
      data: swapData,
      callback: '0x0000000000000000000000000000000000000000',
      callbackData: '0x',
    }];
    const paths = [{
      steps: steps,
      tokenIn: '0x0000000000000000000000000000000000000000',
      amountIn: amount
    }];

    const params = {
      value: amount
    };

    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      params
    )
    return await response.wait();
  };

  async swapTokenToToken(wallet, tokenIn, tokenOut, amount, min = 0) {
    const router = await this.getRouter(wallet);
    // console.log('classicrouter', classicrouter)
    poolAddr = await this.getPool(wallet, tokenIn, tokenOut);
    // 交易模式：
    // 1 - 提取并解包装到原生ETH
    // 2 - 提取并包装到wETH
    const withdrawMode = 1;
    //  构建交易参数
    const swapData = defaultAbiCoder.encode(
      ["address", "address", "uint8"],
      [tokenIn, wallet.address, withdrawMode]
    );
    const steps = [{
      pool: poolAddr,
      data: swapData,
      callback: '0x0000000000000000000000000000000000000000',
      callbackData: '0x',
    }];
    const paths = [{
      steps: steps,
      tokenIn: tokenIn,
      amountIn: amount
    }];

    const params = {
      gasPrice: await wallet.getGasPrice(),
      gasLimit: await router.estimateGas.swap(paths, 0, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), params),
    };

    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      params
    )
    return await response.wait();

  }

  async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=0) {
    const router = await this.getRouter(wallet);
    const poolAddr = await this.getPool(wallet, tokenIn, tokenOut)
    // 交易模式：
    // 1 - 提取并解包装到原生ETH
    // 2 - 提取并包装到wETH
    const withdrawMode = 1;
    //  构建交易参数
    const swapData = defaultAbiCoder.encode(
      ["address", "address", "uint8"],
      [tokenIn, wallet.address, withdrawMode]
    )
    const steps = [{
      pool: poolAddr,
      data: swapData,
      callback: '0x0000000000000000000000000000000000000000',
      callbackData: '0x',
    }];
    const paths = [{
      steps: steps,
      tokenIn: tokenIn,
      amountIn: amount
    }];

    const params = {
      gasPrice: await wallet.getGasPrice(),
      gasLimit: await router.estimateGas.swap(paths, 0, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), {})
    };

    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      params
    )
    return await response.wait();
  }
}
// console.log(SyncSwap);
module.exports = SyncSwap;
