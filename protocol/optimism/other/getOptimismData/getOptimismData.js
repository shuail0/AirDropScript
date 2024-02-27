const axios = require('axios');
const { fixedToFloat } = require('../../../../base/utils');
const ethers = require('ethers');
const { pro } = require('ccxt');


const getTransactionsList = async (address) => {
    let url = `https://api-optimistic.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=latest&page=1&offset=10000&sort=asc`
    const transactions = [];
    try {
        const response = await axios.get(url);
        if (response.data.status === '1') {
            const data = response.data;
            data.result.forEach((transaction) => {
                const {hash, to, from, input, gasUsed, timeStamp, value} = transaction;
                transactions.push({
                    hash: hash,
                    from: from,
                    to: to,
                    data: input,
                    fee: gasUsed,
                    feeInEth: ethers.utils.formatUnits(gasUsed, '10'),
                    receivedAt: timeStamp,
                    transfers: [],
                    value: value,
                });
            });

        } else {
            console.error('Error occurred while retrieving transactions.');
        }
    } catch (error) {
        console.error('Error occurred while making the request:', error);
    }

    return transactions;
}


module.exports = { getTransactionsList };