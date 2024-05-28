/**
 * 项目名称： SyncSwap
 * 项目链接：https://syncswap.xyz/pools
 * 项目文档：https://syncswap.gitbook.io/syncswap/
 * GitHub：https://github.com/syncswap
 * 已完成功能： swapEthToToken, swapTokenToToken, swapTokenToEth
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { defaultAbiCoder } = require('ethers').utils;
// const Dex = require('../../../module/dex.js');
const { getContract } = require('../../../../base/utils');
class SyncSwap {
  constructor() {
    this.name = 'SyncSwap';
    this.routerAddr = '0x80e38291e06339d10aab483c65695d004dbd5c69';
    this.factoryAddr = '0x37BAc764494c8db4e54BDE72f6965beA9fa0AC2d';
    this.routerAbi = require('./abi/SyncSwapRouter.json');
    this.factoryAbi = require('./abi/BasePoolFactory.json');
    this.poolAbi = require('./abi/SyncSwapPoolMaster.json');
  };

  async getPool(wallet, tokenA, tokenB) {
    const classicFactory = getContract(this.factoryAddr, this.factoryAbi, wallet);
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
    const poolAddr = await this.getPool(wallet, tokenIn, tokenOut);
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

    // const params = {
    //   gasPrice: await wallet.getGasPrice(),
    //   gasLimit: await router.estimateGas.swap(paths, 0, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), params),
    // };

    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      // params
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

    const params = [{
      token: tokenIn,
      approveAmount: amount,
      deadline: ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      v: 27,
      r: '0x427b857f817a9842f0ebefce992bb2597ab5b688edfb8ffd9a4f751f7b520298',
      s: '0x2f42b1dac0cf7ae28c1c85829740da6025b2d67259bb5a8f66d7cdad368b0b47'
      // gasPrice: await wallet.getGasPrice(),
      // gasLimit: await router.estimateGas.swap(paths, 0, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), {})
    }];

    const response = await router.swapWithPermit(
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
