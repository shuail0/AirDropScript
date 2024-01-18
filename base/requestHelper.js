const axios = require('axios');

async function sendRequest(url, config, timeout = 5000) {
    const source = axios.CancelToken.source();
    const timer = setTimeout(() => {
        source.cancel(`Request timed out after ${timeout} ms`);
    }, timeout);

    const newConfig = {
        ...config,
        url: url,
        timeout: timeout,
        cancelToken: source.token,
        method: config.method || 'get',
        onDownloadProgress: () => clearTimeout(timer),
    };

    try {
        const response = await axios(newConfig);
        return response.data;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}


module.exports = { sendRequest };