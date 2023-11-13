const ccxt = require('ccxt');
const fs = require('fs');



const loadApiKeys = (exchangeName) => {
    const apiKeys = require('../../config/CexApiKeys.json');
    if (!apiKeys[exchangeName.toLowerCase()]) {
        throw new Error(`API keys for ${exchangeName} not found in api_keys.json`);
    }

    return {
        ...apiKeys[exchangeName.toLowerCase()],
        enableRateLimit: true,
        timeout: 10000,
        rateLimit: 10,
        httpsProxy: 'http://127.0.0.1:7890',
    };
};

const initExchange = (exchangeName, apiKey, apiSecret, password = null, enableRateLimit = true) => {
    const exchangeClass = ccxt[exchangeName.toLowerCase()];
    if (!exchangeClass) {
        throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
    return new exchangeClass(exchangeParams);
};

module.exports = { loadApiKeys, initExchange };
