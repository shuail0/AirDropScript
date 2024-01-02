/**
 * 项目名称：testbridge
 * 项目链接：https://testnetbridge.com/
 * 项目文档：
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

// console.log('contractAddress', contractAddress);

class TestBridge {
    constructor() {
        this.name = 'testbridge';
        this.contractAddress = contractAddress;
        this.contractAbi = require('./abi/testbridege.json');
        // this.bridgeAbi = require('./abi/StargateBridge.json');
        // this.factoryAbi = require('./abi/StargateFactory.json');
        // this.stargateComposerAbi = require('./abi/StargateComposer.json');

    }

    getTestBridgeContract(wallet, contractAddr){
        return getContract(contractAddr, this.contractAbi, wallet)
    }

    async swapAndBridge (wallet, soureChain, dstChain, amount) {
        const contract = this.getTestBridgeContract(wallet, contractAddress[soureChain].contract)
        const dstChainId = contractAddress[dstChain].chainId
        const value = amount.add(ethers.utils.parseEther('0.00014'));
        const gasPrice = await wallet.provider.getGasPrice();
        const gasLimit = await contract.estimateGas.swapAndBridge(
            amount,
            '0x0',
            dstChainId,
            wallet.address,
            wallet.address,
            '0x0000000000000000000000000000000000000000',
            '0x',
            { value }
        )
        const tx = await contract.swapAndBridge(
            amount,
            '0x0',
            dstChainId,
            wallet.address,
            wallet.address,
            '0x0000000000000000000000000000000000000000',
            '0x',
            { gasPrice, gasLimit, value }
        )
        return await tx.wait()
    }

}

module.exports = TestBridge;