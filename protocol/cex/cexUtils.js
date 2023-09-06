const ccxt = require('ccxt');
const fs = require('fs');



const loadApiKeys = (exchangeName) => {
    const apiKeys = require('../../api_keys.json');
    if (!apiKeys[exchangeName.toLowerCase()]) {
        throw new Error(`API keys for ${exchangeName} not found in api_keys.json`);
    }

    return apiKeys[exchangeName.toLowerCase()];
};

const initExchange = (exchangeName, apiKey, apiSecret, password = null, enableRateLimit = true) => {
    const exchangeClass = ccxt[exchangeName.toLowerCase()];
    if (!exchangeClass) {
        throw new Error(`Unsupported exchange: ${exchangeName}`);
    }

    const exchangeParams = {
        apiKey,
        secret: apiSecret,
        enableRateLimit,
        timeout: 3000,
        rateLimit: 10,
        httpsProxy: 'http://127.0.0.1:7890',
        // httpProxy: 'http://127.0.0.1:7890'
    };

    if (password) {
        exchangeParams.password = password;
    }

    return new exchangeClass(exchangeParams);
};

module.exports = { loadApiKeys, initExchange };
