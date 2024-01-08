/**
 * 项目名称：core bridge
 * 项目链接：https://bridge.coredao.org/
 * 项目文档：https://bridge.coredao.org/documentation
 * GitHub：https://github.com/LayerZero-Labs/wrapped-asset-bridge
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
    async estimateBridgeFee(wallet, soureChain, useZro = true, adapterParams = '0x') {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain])
        const bridgeFee = await bridge.estimateBridgeFee(useZro, adapterParams)
        return bridgeFee.nativeFee.add(bridgeFee.zroFee)
    }

    // ERC20跨链
    async bridgeERC20(wallet, soureChain,  tokenAddr, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain]);
        const bridgeFee = await this.estimateBridgeFee(wallet, soureChain);
        const tx = await bridge.bridge(
            tokenAddr,
            amount,
            wallet.address,
            {
                refundAddress: wallet.address,
                zroPaymentAddress: '0x0000000000000000000000000000000000000000'
            },
            '0x',
            {value: bridgeFee}
        );
        return await tx.wait()
    }

}
module.exports = zkBridge;