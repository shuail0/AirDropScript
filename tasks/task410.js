/**
 * tasks61: stk钱包余额查询
 *  查询账户资产，程序按照tokens数组中的token进行查询，。
 *  查询结果将会以csv文件的形式保存在data文件夹下。
 * 
 */


const tasks = require('.');
const { appendObjectToCSV, fixedToFloat, floatToFixed } = require('../base/utils');
const { fetchToken, getBalance, tokenTransfer } = require('../base/coin/stkToken');
const { getTransactionsList } = require('../protocol/starknet/other/voyager/voyager')
const Avnu = require('../protocol/starknet/dex/avnu/avnu.js');

const coinAddress = require('../config/tokenAddress.json').starkNet

module.exports = async (params) => {
    const { Wallet, Address, account, exchangeAddr } = params;

    const tokens = ['USDC', 'WBTC', 'USDT']; // 查询的token名称列表

    const AccountInfo = { Wallet, Address }
    const avnu = new Avnu();

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
    console.log('balances:', balances);



        for (let balanceInfo of balances) {
            const symbol = balanceInfo.symbol;
            const balance = balanceInfo.balance;
            if (balance > 0) {
                console.log(symbol, '余额:', balance, '开始兑换为ETH');
                const token = await fetchToken(coinAddress[symbol], account);
                const swapAmount = floatToFixed(balance, token.decimal);
                // // 交易
                let tx = await avnu.swapTokenToToken(account, token.address, coinAddress.ETH, swapAmount);
                console.log('交易成功，tx:', tx);
            }
        }

    const ethBalance = await getBalance(account, coinAddress.ETH);
    console.log('ETH余额:', fixedToFloat(ethBalance), '开始转账');

    const transferAmount = ethBalance.sub(floatToFixed(0.00001))
    // 向交易所地址转账
    await tokenTransfer(account, coinAddress.ETH, exchangeAddr, transferAmount);
    console.log('转账成功，切换新账户。')
};