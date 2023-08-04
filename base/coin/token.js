const { Wallet } = require('ethers');
const { getContract } = require('../utils.js');
const abi = require('./erc20.json');

// 获取交易代币合约地址
const getSwapTokenAddress = (token) => {
    return token.wrapTokenAddress ?? token.address
};

// 获取代币信息
const fetchToken = async (tokenAddr, provider) => {
    const contract = await getContract(tokenAddr, abi, provider);
    const decimal = await contract.decimals();
    const symbol = await contract.symbol();
    const name = await contract.name();
    // const network = await provider.getNetwork();
    const tokenInfo = {
        name: name,
        symbol: symbol,
        decimal: decimal,
        address: tokenAddr,
        // network: network
    };
    return tokenInfo
};

// 获取代币余额信息
const getBalance = async (wallet, tokenAddr) => {
    return await wallet.getBalance(tokenAddr);
}

// 授权
const tokenApprove = async (Wallet, tokenAddr, spender, approveValue) => {
    const tokenContract = getContract(tokenAddr, abi, Wallet);
    const txApprove = await tokenContract.approve(spender, approveValue);
    return await txApprove.wait();
};

module.exports = { getSwapTokenAddress, fetchToken, getBalance, tokenApprove }