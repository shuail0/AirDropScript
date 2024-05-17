const ethers = require('ethers');
const AnalogDeploy = require('../protocol/testNet/analog/deploy.js');
const RPC = require('../config/RpcConfig.json');
const { appendObjectToCSV } = require('../base/utils');

module.exports = async (params) => {
    const { pky } = params;
    const provider = new ethers.providers.JsonRpcProvider(RPC.sepolia);
    const wallet = new ethers.Wallet(pky, provider);
    const analogDeploy = new AnalogDeploy();
    const AccountInfo = { Address: wallet.address };

    const transactionResults = [];

    for (let i = 0; i < 1; i++) {
        try {
            // 部署合约
            const contractAddress = await analogDeploy.deployContract(wallet);
            if (!contractAddress) {
                console.error(`第 ${i + 1} 次合约部署失败`);
                continue;
            }
            console.log(`第 ${i + 1} 次合约部署成功，合约地址: ${contractAddress}`);

            // 验证合约
            const verifyStatus = await analogDeploy.verifyContract(contractAddress);
            if (verifyStatus) {
                console.log(`第 ${i + 1} 次合约验证成功`);
            } else {
                console.log(`第 ${i + 1} 次合约验证失败`);
            }

            // 合约交互
            const txHash = await analogDeploy.subMessage(wallet, analogDeploy.generateRandomHex);
            console.log(`第 ${i + 1} 次合约交互成功，交互hash: ${txHash}`);

            transactionResults.push({
                AccountInfo,
                contractAddress,
                verifyStatus: verifyStatus ? 'Success' : 'Failure',
                txHash
            });
        } catch (error) {
            console.error(`第 ${i + 1} 次操作失败，错误: ${error.message}`);
        }
    }

    // 保存数据
    for (const result of transactionResults) {
        await appendObjectToCSV(result, '../data/analog.csv');
    }
}
