/**
 * 项目名称：core bridge
 * 项目链接：https://bridge.harmony.one/
 * 项目文档：https://docs.harmony.one/home/general/layerzero-bridge
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

class harmonyBridge {
    constructor() {
        this.name = 'harmonybridge';
        this.contractAddress = contractAddress;

        this.bridgeAbi = require('./abi/birdge.json');

    }

    getBridgeContract(wallet, bridgeAddr) {
        return getContract(bridgeAddr, this.bridgeAbi, wallet)
    }

    // 预估跨链费用
    async estimateBridgeFee(wallet,soureChain, dstChain, token, amount, useZro = true, adapterParams = '0x') {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contractAddress[token])
        const bridgeFee = await bridge.estimateSendFee(contractAddress[dstChain].chainId, wallet.address, amount, useZro, adapterParams)
        return bridgeFee.nativeFee.add(bridgeFee.zroFee)
    }

    // ERC20跨链
    async bridgeERC20(wallet, soureChain, dstChain, tokenName, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contractAddress[tokenName]);
        const bridgeFee = await this.estimateBridgeFee(wallet, soureChain, dstChain, tokenName, amount);
        console.log('bridgeFee: ', bridgeFee);
        const tx = await bridge.sendFrom(
            wallet.address,
            contractAddress[dstChain].chainId,
            wallet.address,
            amount,
            wallet.address,
            '0x0000000000000000000000000000000000000000',
            '0x',
            {value: bridgeFee}
        );
        return await tx.wait()
    }

}
module.exports = harmonyBridge;