/**
 * tasks61: stk钱包余额查询
 *  查询账户资产，程序按照tokens数组中的token进行查询，。
 *  查询结果将会以csv文件的形式保存在data文件夹下。
 * 
 */


const tasks = require('.');
const { appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance } = require('../base/coin/stkToken');
const { getTransactionsList } = require('../protocol/starknet/other/voyager/voyager')

const coinAddress = require('../config/tokenAddress.json').starkNet

module.exports = async (params) => {
    const { Wallet, Address, account } = params;

    const tokens = ['ETH']; // 查询的token名称列表

    const AccountInfo = { Wallet, Address }
    // // 查询余额
    let balancePromises = tokens.map(async (tokenSymbol) => {
        const token = await fetchToken(coinAddress[tokenSymbol], account);
        const tokenBalance = await getBalance(account, token.address);
        return {
            symbol: token.symbol,
            balance: fixedToFloat(tokenBalance, token.decimal)
        };
    });
    
    let balances = await Promise.all(balancePromises);
    
    balances.forEach(balanceInfo => {
        AccountInfo[balanceInfo.symbol] = balanceInfo.balance;
    });

    // 查询交易记录
    const transactions = await getTransactionsList(Address);
    // 求transactions的列表中的actual_fee字段的和
    const gasFee = transactions.reduce((acc, cur) => {
        return acc + cur.actual_fee;
    }, 0);
    AccountInfo.txCount = transactions.length;
    AccountInfo.usedGasFee = gasFee;    

    await appendObjectToCSV(AccountInfo, '../data/stkBalances.csv')

};

