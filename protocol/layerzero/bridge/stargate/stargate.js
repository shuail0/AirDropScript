/**
 * 项目名称：Stargate
 * 项目链接：https://stargate.finance/
 * 项目文档：https://stargateprotocol.gitbook.io/stargate/
 * GitHub：https://github.com/stargate-protocol
 * 已完成功能： 
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed, multiplyBigNumberWithDecimal, fixedToFloat } = require('../../../../base/utils');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');
const contractAddress = require('./contractAddress2.js')

// console.log('contractAddress', contractAddress);

class Stargate {
    constructor() {
        this.name = 'stargate';
        this.contractAddress = contractAddress;
        this.routerAbi = require('./abi/StargateRouter.json');
        this.routerETHAbi = require('./abi/StargateRouterETH.json');
        this.poolAbi = require('./abi/StargatePool.json');
        this.STGAbi = require('./abi/StargateSTG.json');
        // this.bridgeAbi = require('./abi/StargateBridge.json');
        // this.factoryAbi = require('./abi/StargateFactory.json');
        // this.stargateComposerAbi = require('./abi/StargateComposer.json');

    }

    getRouterETHContract(wallet, routerETHAddr) {
        return getContract(routerETHAddr, this.routerETHAbi, wallet)
    }
    getRouterContract(wallet, routerAddr) {
        return getContract(routerAddr, this.routerAbi, wallet)
    }
    getPoolContract(wallet, poolAddr) {
        return getContract(poolAddr, this.poolAbi, wallet)
    }
    getSTGContract(wallet, stgAddr) {
        return getContract(stgAddr, this.STGAbi, wallet)
    }
    // 预估跨链费用
    async getCrossChainFee(wallet, soureChain, dstChain, functionType) {

        const router = this.getRouterContract(wallet, contractAddress[soureChain].contracts.Router)

        const quoteData = await router.quoteLayerZeroFee(
            contractAddress[dstChain].chainId,
            functionType,
            wallet.address,
            '0x',
            ({
                dstGasForCall: 0,       // extra gas, if calling smart contract,
                dstNativeAmount: 0,     // amount of dust dropped in destination wallet 
                dstNativeAddr: wallet.address // destination wallet for dust
            })
        )
        return quoteData[0]
    }

    // ETH跨链
    async swapETH(wallet, soureChain, dstChain, amount) {
        const routerETH = this.getRouterETHContract(wallet, contractAddress[soureChain].contracts.RouterETH);
        const feewei = await this.getCrossChainFee(wallet, soureChain, dstChain, 1);
        const value = amount.add(feewei);
        const gasPrice = await wallet.provider.getGasPrice();
        const gasLimit = await routerETH.estimateGas.swapETH(
            contractAddress[dstChain].chainId,
            wallet.address,
            wallet.address,
            amount,
            multiplyBigNumberWithDecimal(amount, 0.95),
            { value }
        )

        const response = await routerETH.swapETH(
            contractAddress[dstChain].chainId,
            wallet.address,
            wallet.address,
            amount,
            multiplyBigNumberWithDecimal(amount, 0.95),
            { value, gasPrice, gasLimit }
        )
        return await response.wait();
    }

    async swap(wallet, soureChain, dstChain, soureCoin, dstCoin, amount) {
        const router = this.getRouterContract(wallet, contractAddress[soureChain].contracts.Router);
        const value = await this.getCrossChainFee(wallet, soureChain, dstChain, 1);
        const gasPrice = await wallet.provider.getGasPrice();
        const gasLimit = await router.estimateGas.swap(
            contractAddress[dstChain].chainId,
            contractAddress[soureChain].PoolID[soureCoin],
            contractAddress[dstChain].PoolID[dstCoin],
            wallet.address,
            amount,
            multiplyBigNumberWithDecimal(amount, 0.95),
            { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x0000000000000000000000000000000000000000" },
            wallet.address,
            '0x',
            { value: value }
        )
  
        const response = await router.swap(
            contractAddress[dstChain].chainId,
            contractAddress[soureChain].PoolID[soureCoin],
            contractAddress[dstChain].PoolID[dstCoin],
            wallet.address,
            amount,
            multiplyBigNumberWithDecimal(amount, 0.95),
            { dstGasForCall: 0, dstNativeAmount: 0, dstNativeAddr: "0x0000000000000000000000000000000000000000" },
            wallet.address,
            '0x',
            { gasPrice, gasLimit, value }
        )
        return await response.wait();
    }

    async sendSTG(wallet, soureChainSTGAddress, dstChain, amount) {
        const STGContract = this.getSTGContract(wallet, soureChainSTGAddress);
        // estimatesSendTokensFee
        const sendFee = await STGContract.estimateSendTokensFee(
            contractAddress[dstChain].chainId, // dstChainID
            true, // useZero
            '0x00010000000000000000000000000000000000000000000000000000000000014c08'
        );
        let value = sendFee.nativeFee.add(sendFee.zroFee)
        // 增加10%的value
        value = value.add(value.div(10));
        console.log('value', ethers.utils.formatEther(value));
        // 给2倍gasPrice
        let gasPrice = (await wallet.provider.getGasPrice()).mul(2);
        const gasLimit = await STGContract.estimateGas.sendTokens(
            contractAddress[dstChain].chainId, // dstChainID
            wallet.address, // dstAddress
            amount, // amount
            '0x0000000000000000000000000000000000000000',
            '0x00010000000000000000000000000000000000000000000000000000000000014c08',
            { value }
        );
        // console.log('gasPrice', gasPrice.toString());
        // console.log('gasLimit', gasLimit.toString());
        // // 打印预估费用（gasPrice * gasLimit + value）
        console.log('预估费用', ethers.utils.formatEther(gasPrice.mul(gasLimit).add(value)));
        const response = await STGContract.sendTokens(
            contractAddress[dstChain].chainId, // dstChainID
            wallet.address, // dstAddress
            amount, // amount
            '0x0000000000000000000000000000000000000000',
            '0x00010000000000000000000000000000000000000000000000000000000000014c08',
            { gasPrice, gasLimit, value }
        );
        return await response.wait();
     }

    async addLiquidity() { }
    async withdrawLocal() { }


}

module.exports = Stargate;