/**
 * 项目名称：StoneBridge
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

class StoneBridge {
    constructor() {
        this.name = 'Stone';
        this.contractAddress = contractAddress;

        this.bridgeAbi = require('./abi/stakeStoneEther.json');

    }

    getBridgeContract(wallet, bridgeAddr) {
        return getContract(bridgeAddr, this.bridgeAbi, wallet)
    }

    // 预估跨链费用
    async estimateBridgeFee(wallet, soureChain, dstChain, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contract);
        const bridgeFee = await bridge.estimateSendFee(contractAddress[dstChain].chainId, wallet.address, amount, true, '0x') // 第一个参数是poolid，这里写死1
        return bridgeFee;
    }

    // ETH跨链
    async bridgeStone(wallet, soureChain, dstChain, amount) {
        const bridge = this.getBridgeContract(wallet, contractAddress[soureChain].contract);
        const bridgeFee = await this.estimateBridgeFee(wallet, soureChain, dstChain, amount);
        let gasPrice = await wallet.provider.getGasPrice();
        if (soureChain === 'Mode') {
            gasPrice = gasPrice.mul(15).div(100); // 减少85%的gasPrice
        }
        const tx = await bridge.sendFrom(
            wallet.address,
            contractAddress[dstChain].chainId,
            wallet.address,
            amount,
            wallet.address,
            '0x0000000000000000000000000000000000000000',
            '0x',
            { value: bridgeFee.nativeFee, gasPrice}
        );
        return await tx.wait()
    }
}
module.exports = StoneBridge;