/**
 * 多交易所提币程序
 * 具体执行逻辑参照task52.js
 */


const { loadApiKeys } = require('./cexUtils');
const Bitget = require('./bitget');
const OKX = require('./okx');
const Binance = require('./binance');


const multExchangeWithdraw = async (params) => {
    const { Address, tag, currency, amount, chain, exchange_name } = params;  // 提取需要的参数

    const apiKeys = loadApiKeys(exchange_name);
    switch (exchange_name.toLowerCase()) {
        case 'okx':
            exchangeInstance = new OKX(apiKeys);
            break;
        case 'bitget':
            exchangeInstance = new Bitget(apiKeys);
            break;
        case 'binance':
            exchangeInstance = new Binance(apiKeys);
            break;
        default:
            throw new Error(`Exchange ${exchange_name} is not supported`);
    }
    await exchangeInstance.withdraw(Address, tag, currency, amount, chain);
};


const assetPooling = async (params) => {
    const { currency, exchange_name } = params;  // 提取需要的参数

    const apiKeys = loadApiKeys(exchange_name);
    switch (exchange_name.toLowerCase()) {
        case 'okx':
            exchangeInstance = new OKX(apiKeys);
            break;
        case 'bitget':
            exchangeInstance = new Bitget(apiKeys);
            break;
        default:
            throw new Error(`Exchange ${exchange_name} is not supported`);
    }
    await exchangeInstance.assetTransferFromSubAccountToMainAccounAll(currency);
};

module.exports = { multExchangeWithdraw, assetPooling };
