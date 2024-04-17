const { Wallet, BigNumber } = require('ethers');
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

// 获取代币余额信息, 默认0地址是zks的ETH的地址，仅限于zksync网络
const getBalance = async (wallet, tokenAddr='0x0000000000000000000000000000000000000000') => {
    return await wallet.getBalance(tokenAddr, 'latest');
};

// 获取erc20代币余额信息,用于非zksync网络
const getErc20Balance = async (wallet, tokenAddr) => {
    const tokenContract = getContract(tokenAddr, abi, wallet);
    return await tokenContract.balanceOf(wallet.address);
};

const getAllowance = async (wallet, tokenAddr, spender) => {
    const tokenContract = getContract(tokenAddr, abi, wallet);
    return await tokenContract.allowance(wallet.address, spender);
};

// 授权
const tokenApprove = async (Wallet, tokenAddr, spender, approveValue) => {
    const tokenContract = getContract(tokenAddr, abi, Wallet);
    const txApprove = await tokenContract.approve(spender, approveValue);
    return await txApprove.wait();
};

// 代币转账
const tokenTransfer = async (wallet, tokenAddr, amount, address) => {
    const tokenContract = getContract(tokenAddr, abi, wallet);
    const tx = await tokenContract.transfer(address, amount);
    return await tx.wait();
};



// erc20代币转账，仅限于zksync网络
const tokenTrasfer = async (wallet, address, amount,tokenAddr='0x0000000000000000000000000000000000000000') => {
    const transfer = await wallet.transfer({
        to: address,
        token: tokenAddr,
        amount
    })
    return await transfer.wait()
};

// 检查授权，对于授权小于交易所需的数量，需要授权10倍的数量
async function checkApprove(wallet, tokenAddr, spender, approveValue) {
    const allowance = await getAllowance(wallet, tokenAddr, spender);
    if (allowance.lt(approveValue)) {
        console.log('授权不足，开始授权')
        await tokenApprove(wallet, tokenAddr, spender, approveValue.mul(BigNumber.from(10)));
        console.log('授权成功，开始交易')
    } else {
        console.log('授权充足，开始交易')
    }
}

module.exports = { getSwapTokenAddress, fetchToken, getBalance, tokenApprove, tokenTrasfer, getAllowance, checkApprove, getErc20Balance, tokenTransfer }