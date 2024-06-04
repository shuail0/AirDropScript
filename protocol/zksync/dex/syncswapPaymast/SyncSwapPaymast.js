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
const { utils, Wallet, Provider, } = require('zksync-web3');
const { getContract, floatToFixed } = require('../../../../base/utils');
const { getTokenContract, checkApprove } = require('../../../../base/coin/token');
const { pro } = require('ccxt');
// const { trackReceivedTokenAndTx } = require('@1inch/solidity-utils');

// const e6 = (value) => ether(value) / BigInt('1000000000000');

class SyncSwapPaymast {
  constructor() {
    this.name = 'SyncSwap';
    this.routerAddr = '0x9B5def958d0f3b6955cBEa4D5B7809b2fb26b059';
    this.factoryAddr = '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb';
    this.paymasterAddress = '0x0c08f298A75A090DC4C0BB4CaA4204B8B9D156c1';
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

  async swapEthToToken(wallet, tokenIn, tokenOut, amount, min = 0) {
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

    const paymasterParams = utils.getPaymasterParams(this.paymasterAddress, {
      type: 'approvalBased',
      token: tokenInInfo.address,
      minimalAllowance: floatToFixed(0.5, tokenInInfo.decimal),
      innerInput: defaultAbiCoder.encode(
        ["uint64"],
        [15]
      )
    });


    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      params
    )
    return await response.wait();
  };


  async swapTokenToEth(wallet, tokenInInfo, tokenOutInfo, amount, min = 0) {

    const router = await this.getRouter(wallet);
    const poolAddr = await this.getPool(wallet, tokenInInfo.address, tokenOutInfo.address);
    // 交易模式：
    // 1 - 提取并解包装到原生ETH
    // 2 - 提取并包装到wETH
    const withdrawMode = 1;
    //  构建交易参数
    const swapData = defaultAbiCoder.encode(
      ["address", "address", "uint8"],
      [tokenInInfo.address, wallet.address, withdrawMode]
    )
    const steps = [{
      pool: poolAddr,
      data: swapData,
      callback: '0x0000000000000000000000000000000000000000',
      callbackData: '0x',
      useVault: true
    }];
    const paths = [{
      steps: steps,
      tokenIn: tokenInInfo.address,
      amountIn: amount,
    }];

    const params = {
      gasPrice: await wallet.getGasPrice(),
      gasLimit: await router.estimateGas.swap(paths, min, ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), {})
    };

    const paymasterParams = utils.getPaymasterParams(this.paymasterAddress, {
      type: 'approvalBased',
      token: tokenInInfo.address,
      minimalAllowance: floatToFixed(0.5, tokenInInfo.decimal),
      innerInput: defaultAbiCoder.encode(
        ["uint64"],
        [15]
      )
    });

    console.log('paymasterParams', paymasterParams);


    // const response = await router.populateTransaction.swap(
    //   paths,
    //   0,
    //   ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
    //   {
    //     ...params,
    //     customData: {
    //       paymasterParams: paymasterParams,
    //       ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
    //     },
    //   }
    // )
    // console.log('response', response);
    // process.exit(0);
    const response = await router.swap(
      paths,
      0,
      ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
      {
        ...params,
        customData: {
          paymasterParams: paymasterParams,
          ergsPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        },
      }
    )

    return await response.wait();



  }
}
module.exports = SyncSwapPaymast;
