/**
 * 多交易所提币程序，目前只加了OKX
 * 具体执行逻辑参照task13.js
 */

const { loadApiKeys, initExchange } = require('./cexUtils');
const { okxWithdraw } = require('./okx/okx');

const multExchangeWithdraw = async (params) => {
    const { Address, tag, currency, amount, chain, exchange_name } = params;  // 提取需要的参数

    const apiKeys = loadApiKeys(exchange_name);
    const exchange = initExchange(exchange_name, ...Object.values(apiKeys));

    if (exchange_name.toLowerCase() === 'okx') {
        await okxWithdraw(exchange, Address, tag, currency, amount, chain);
    }
    // ... other exchanges

};

module.exports = { multExchangeWithdraw };
