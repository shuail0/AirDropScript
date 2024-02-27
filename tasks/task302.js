/**
 * tasks302: ethereum balance query
 *  查询账户资产，程序按照tokens数组中的token进行查询，。
 *  查询结果将会以csv文件的形式保存在data文件夹下。
 * 
 */


const tasks = require('.');
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance, getErc20Balance } = require('../base/coin/token');
const { getTransactionsList } = require('../protocol/ethereum/other/getEthereumData/getEthereumData')


const tokenAddress = require('../config/tokenAddress.json')

module.exports = async (params) => {
    const { Wallet, Address, pky } = params;
    const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'zkSync']
    const chain = 'Ethereum'
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));

    const tokens = ['WETH', 'USDC', 'USDT']; // 查询的token名称列表

    const AccountInfo = { Wallet, Address }
    // 查询ETH余额
    const ethBalance = await wallet.getBalance();
    const ethBalanceFloat = fixedToFloat(ethBalance, 18);
    AccountInfo.ETH = ethBalanceFloat;

    // // 查询余额
    let balancePromises = tokens.map(async (tokenSymbol) => {
        const token = await fetchToken(tokenAddress[chain][tokenSymbol], wallet);
        const tokenBalance = await getErc20Balance(wallet, token.address);
        return {
            symbol: token.symbol,
            balance: fixedToFloat(tokenBalance, token.decimal)
        };
    });

    let balances = await Promise.all(balancePromises);

    balances.forEach(balanceInfo => {
        AccountInfo[balanceInfo.symbol] = balanceInfo.balance;
    });


    let retryCount = 0;
    while (retryCount < 5) {
        try {
            // // 查询交易记录
            const transactions = await getTransactionsList(wallet.address);
            // 筛选出钱包发起的交易
            const filteredTransactions = transactions.filter(transaction => transaction.from.toLowerCase() === wallet.address.toLowerCase());
            // // 求transactions的列表中的actual_fee字段的和
            const gasFee = transactions.reduce((acc, cur) => {
                return acc + parseFloat(cur.feeInEth);
            }, 0);
            AccountInfo.txCount = filteredTransactions.length;
            AccountInfo.usedGasFee = gasFee;
            break; // Exit the loop if successful
        } catch (error) {
            retryCount++;
            console.log(`Retry ${retryCount} failed: ${error}`);
            await sleep(0.5)
        }
    }

    console.log(`${chain} accountInfo：`,AccountInfo);
    await appendObjectToCSV(AccountInfo, `../data/${chain}Balances.csv`)


};

