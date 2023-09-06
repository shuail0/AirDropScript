const { Provider, Account, constants, Contract, num, shortString, BigNumberish, CallData } = require('starknet');
const abi = require('./stkToken.json');
const { getContract, feltToStr, feltToInt } = require('../stkUtils');

function getTokenContract(tokenAddr, provider) {
    return getContract(tokenAddr, abi, provider);
}

async function fetchToken(tokenAddr, provider) {
    const contract = getTokenContract(tokenAddr, provider);
    const decimal = await contract.decimals();
    const symbol = await contract.symbol();
    const name = await contract.name();

    const tokenInfo = {
        name: feltToStr(name.name),
        symbol: feltToStr(symbol.symbol),
        decimal: feltToInt(decimal.decimals),
        address: tokenAddr,
    };
    return tokenInfo;
}

async function getBalance(account, tokenAddr) {
    const contract = getTokenContract(tokenAddr, account);
    const balance = await contract.balanceOf(account.address);
    return balance.balance;
}

async function tokenApprove(account, tokenAddr, spender, amount) {
    const contract = getTokenContract(tokenAddr, account);
    const response = await contract.approve(spender, amount);
    const tx = await account.waitForTransaction(response.transaction_hash);
    return tx.transaction_hash;
}

function getApproveCallData(tokenAddr, spender, amount) {
    const params = {
        contractAddress: tokenAddr,
        entrypoint: "approve",
        calldata: CallData.compile({
            spender: spender,
            amount: amount,
        })
    };
    return params;
}

async function tokenTransfer(account, tokenAddr, toAddr, amount) {
    const contract = getTokenContract(tokenAddr, account); // Changed from `wallet` to `account`
    const response = await contract.transfer(toAddr, amount);
    const tx = await account.waitForTransaction(response.transaction_hash);
    return tx.transaction_hash;
}

module.exports = {
    getTokenContract,
    fetchToken,
    getBalance,
    tokenApprove,
    getApproveCallData,
    tokenTransfer,
};
