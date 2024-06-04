/**
 * tasks303: 查询evm钱包余额
 *  查询账户资产，程序按照tokens数组中的token进行查询。
 *  要增加新的链，在chains数组中添加链的名称, 同时在config/RpcConfig.json目录下增加链的rpc地址。
 *  要增加新的token，在tokens数组中添加token的名称, 同时在config/tokenAddress.json目录下增加token地址。
 *  查询结果将会以csv文件的形式保存在data文件夹下。
 * 
 */


const tasks = require('.');
const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { appendObjectToCSV, fixedToFloat } = require('../base/utils');
const { fetchToken, getBalance, getErc20Balance } = require('../base/coin/token');
const { getTransactionsList } = require('../protocol/arbitrum/other/getArbitrumData/getArbitrumData');


const tokenAddress = require('../config/tokenAddress.json')

module.exports = async (params) => {
    const { Wallet, Address, pky } = params;
    const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'zkSync', 'Linea']
    const tokens = ['WETH', 'USDC', 'USDT', 'BTC', 'NativeUSDC']; // 查询的token名称列表

    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i]
        const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC[chain]));
        const AccountInfo = { Wallet, Address }
        // 查询ETH余额
        const ethBalance = await wallet.getBalance();
        const ethBalanceFloat = fixedToFloat(ethBalance, 18);
        AccountInfo.ETH = ethBalanceFloat;
        // // 查询余额
        let balancePromises = tokens.map(async (tokenSymbol) => {
            if (tokenAddress[chain][tokenSymbol]) {
                const token = await fetchToken(tokenAddress[chain][tokenSymbol], wallet);
                const tokenBalance = await getErc20Balance(wallet, token.address);
                return {
                    symbol: tokenSymbol,
                    balance: fixedToFloat(tokenBalance, token.decimal)
                };
            }
        });

        let balances = await Promise.all(balancePromises);

        balances.forEach(balanceInfo => {
            if (balanceInfo) {
                AccountInfo[balanceInfo.symbol] = balanceInfo.balance;
            }
        });

        console.log(`${chain} accountInfo：`, AccountInfo);
        await appendObjectToCSV(AccountInfo, `../data/${chain}Balances.csv`)
    }
};

