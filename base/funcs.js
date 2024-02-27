const ethers = require('ethers');
const winston = require('winston');
const fs = require('fs');
const { BigNumber, utils } = require('ethers');
const crypto = require('crypto');
const Papa = require('papaparse');

// 连接合约
const getContract = (address, abi, provider) => {
    return new ethers.Contract(address, abi, provider)
};

// 增加10%的gasPrice
const add10PercentGasPrice = async (wallet) => {
    const gasPrice = await wallet.provider.getGasPrice();
    return gasPrice.mul(110).div(100);
};


// 发送ETH
async function transferETHWithData(wallet, contractAddress, transactionData, value = '0x0') {

    const gasLimit = await wallet.provider.estimateGas({
        from: wallet.address,
        to: contractAddress,
        value: value,
        data: transactionData
    });
    const transaction = {
        from: wallet.address,
        to: contractAddress,
        gasLimit: gasLimit,
        gasPrice: await wallet.provider.getGasPrice(),
        nonce: await wallet.getTransactionCount(),
        value: value,
        data: transactionData
    };

    const response =  await wallet.sendTransaction(transaction);
    return await response.wait();
}

module.exports = { getContract, transferETHWithData, add10PercentGasPrice };