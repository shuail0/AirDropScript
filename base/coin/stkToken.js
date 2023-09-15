const { Provider, Account, constants, Contract, num, shortString, BigNumberish, CallData } = require('starknet');
const abi = require('./stkToken.json');
const { getContract, feltToStr, feltToInt, bigNumbetToUint256, uint256ToBigNumber } = require('../stkUtils');

function getTokenContract(tokenAddr, provider) {
    return getContract(tokenAddr, abi, provider);
}

async function fetchToken(tokenAddr, provider) {
    const contract = getTokenContract(tokenAddr, provider);
    const promises = [contract.name(), contract.symbol(), contract.decimals()];
    const results = await Promise.all(promises);

    const tokenInfo = {
        name: feltToStr(results[0].name),
        symbol: feltToStr(results[1].symbol),
        decimal: feltToInt(results[2].decimals),
        address: tokenAddr,
    };
    return tokenInfo;
}

async function getBalance(account, tokenAddr) {
    const contract = getTokenContract(tokenAddr, account);
    const balance = await contract.balanceOf(account.address);
    return uint256ToBigNumber(balance.balance);
}

async function tokenApprove(account, tokenAddr, spender, amount) {
    amount = bigNumbetToUint256(amount);
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
            amount: bigNumbetToUint256(amount),
        })
    };
    return params;
}

async function tokenTransfer(account, tokenAddr, toAddr, amount) {
    amount = bigNumbetToUint256(amount);
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
