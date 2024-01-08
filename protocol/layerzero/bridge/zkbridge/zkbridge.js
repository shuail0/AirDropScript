/**
 * 项目名称：zkBridge
 * 项目链接：https://zkbridge.com/token
 * 项目文档：https://docs.zkbridge.com/
 * GitHub：
 * 已完成功能： 
 * 
 */

const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed, multiplyBigNumberWithDecimal, fixedToFloat } = require('../../../../base/utils');
const { Wallet, Provider } = require('zksync-web3');
const { tokenApprove } = require('../../../../base/coin/token');
const contractAddress = require('./contractAddress.js')

class zkBridge {
    constructor() {
        this.name = 'zkBridge';
        this.contractAddress = contractAddress;

        this.bridgeAbi = require('./abi/zkBridge.json');

    }

    getBridgeContract(wallet, bridgeAddr) {
        return getContract(bridgeAddr, this.bridgeAbi, wallet)
    }

    // 预估跨链费用
    async estimateBridgeFee(wallet, soureChain, dstChainId, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contract);
        const bridgeFee = await bridge.estimateFee(1, dstChainId, amount) // 第一个参数是poolid，这里写死1
        return bridgeFee;
    }

    // ETH跨链
    async bridgeETH(wallet, soureChain, dstChain, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contract);
        const bridgeFee = await this.estimateBridgeFee(wallet, soureChain, contractAddress[dstChain].chainId, amount);
        const tx = await bridge.transferETH(
            contractAddress[dstChain].chainId,
            amount,
            wallet.address,
            { value: amount.add(bridgeFee) }
        );
        return await tx.wait()
    }
}
module.exports = zkBridge;