const axios = require('axios');
const ethers = require('ethers');
const contractBytecode = require('./abi/bytecode.json');

class AnalogDeploy {
    constructor() {
        this.name = 'AnalogDeploy';
    }

    async deployContract(wallet) {
        const contractABI = [
            "constructor(address gateway)",
            "function onGmpReceived(bytes32 id, uint128 network, bytes32 source, bytes calldata payload) external payable returns (bytes32)",
            "function number() view returns (uint256)"
        ];
        const gatewayAddr = '0xb5d83c2436ad54046d57cd48c00d619d702f3814';
        const factory = new ethers.ContractFactory(contractABI, contractBytecode.bytecode, wallet);
        const gasPrice = await wallet.provider.getGasPrice();
        const increasedGasPrice = gasPrice.mul(120).div(100);
        const deployTransaction = factory.getDeployTransaction(gatewayAddr);
        const gasLimit = await wallet.estimateGas(deployTransaction);
        const increasedGasLimit = gasLimit.mul(120).div(100);

        const options = {
            gasPrice: increasedGasPrice,
            gasLimit: increasedGasLimit
        };

        const deployContract = await factory.deploy(gatewayAddr, options);
        await deployContract.deployed();
        console.log('合约部署成功，合约地址:', deployContract.address);
        return deployContract.address;
    }

    async verifyContract(contractAddress) {
        const url = `https://eth-sepolia.blockscout.com/api/v2/smart-contracts/${contractAddress}/verification/via/flattened-code`;
        const params = {
            "compiler_version": "v0.8.25+commit.b61c2a91",
            "source_code": `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\ninterface IGmpReceiver {\n    /**\n     * @dev Handles the receipt of a single GMP message。\n     * The contract must verify the msg.sender, it must be the Gateway Contract address。\n     *\n     * @param id The EIP-712 hash of the message payload, used as GMP unique identifier\n     * @param network The chain_id of the source chain that send the message\n     * @param source The pubkey/address which sent the GMP message\n     * @param payload The message payload with no specified format\n     * @return 32-byte result, which will be stored together with the GMP message\n     */\n    function onGmpReceived(bytes32 id, uint128 network, bytes32 source, bytes calldata payload)\n        external\n        payable\n        returns (bytes32);\n}\n\ncontract Counter is IGmpReceiver {\n    // sepolia 0xB5D83c2436Ad54046d57Cd48c00D619D702F3814\n    // shibuya 0xF871c929bE8Cd8382148C69053cE5ED1a9593EA7\n    address private immutable _gateway;\n    uint256 public number;\n\n    constructor(address gateway) {\n        _gateway = gateway;\n    }\n\n    function onGmpReceived(bytes32, uint128, bytes32, bytes calldata) external payable override returns (bytes32) {\n        require(msg.sender == _gateway, \"unauthorized\");\n        number++;\n        return bytes32(number);\n    }\n}`,
            "is_optimization_enabled": false,
            "is_yul_contract": false,
            "optimization_runs": "200",
            "evm_version": "default",
            "autodetect_constructor_args": false,
            "constructor_args": "",
            "license_type": "none"
        };

        try {
            const response = await axios.post(url, params);
            const data = response.data;

            // 检查响应数据以确定验证状态
            if (response.status === 200 && data.message && data.message.toLowerCase().includes("started")) {
                console.log('合约验证成功，验证结果:', data.message);
                return true;
            } else {
                console.error('合约验证失败，验证结果:', data.message || response.status);
                return false;
            }
        } catch (error) {
            console.error('合约验证请求出错:', error.message);
            return false;
        }
    }

    generateRandomHex() {
        const minLength = 6;
        const maxLength = 9;
        let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        if (length % 2 !== 0) {
            length += 1;
        }
        let result = '0x';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 16).toString(16);
        }
        return result;
    }

    async subMessage(wallet, generateRandomHex) {
        const address = wallet.address;
        const contractAddress = '0xB5D83c2436Ad54046d57Cd48c00D619D702F3814';
        const contractABI = require('./abi/abi.json');
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);

        const id = generateRandomHex();

        const tx = await contract.submitMessage(
            address,
            1,
            1000000,
            id,
        );
        await tx.wait();
        return tx.hash;
    }
}

module.exports = AnalogDeploy;
