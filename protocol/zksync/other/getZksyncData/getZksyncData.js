const axios = require('axios');
const { fixedToFloat } = require('../../../../base/utils');
const ethers = require('ethers');
// import {getEthPrice} from "@utils";


const getAllTransfers = async (address) => {
    let url = `https://block-explorer-api.mainnet.zksync.io/address/${address}/transfers?limit=100&page=1`;
    const transfers = [];

    while (true) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                const data = response.data.items;
                transfers.push(...data);
                if (response.data.links.next === '') break;
                url = 'https://block-explorer-api.mainnet.zksync.io/' + response.data.links.next;
            } else {
                console.error('Error occurred while retrieving transactions.');
                break;
            }
        } catch (error) {
            console.error('Error occurred while making the request:', error);
            break;
        }
    }

    return transfers;
};

const assignTransferValues = async (transactions) => {
    const ethResponse = await axios.post('https://mainnet.era.zksync.io/', {
        id: 42,
        jsonrpc: '2.0',
        method: 'zks_getTokenPrice',
        params: ['0x0000000000000000000000000000000000000000'],
    });
    const tokensPrice = {
        USDC: 1,
        USDT: 1,
        ZKUSD: 1,
        CEBUSD: 1,
        LUSD: 1,
        ETH: parseInt(ethResponse.data.result),
    };

    transactions.forEach((transaction) => {
        transaction.transfers.forEach((transfer) => {
            transfer.token.price = tokensPrice[transfer.token.symbol.toUpperCase()];
        });
        transaction.transfers = transaction.transfers.filter((transfer) => transfer.token.price !== undefined);
    });
};

const getTransactionsList = async (address) => {
    let url = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=1`;
    const transactions = [];
    // const ethResponse = await getEthPrice();
    while (true) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                const data = response.data.items;
                data.forEach((transaction) => {
                    const {hash, to, from, data, isL1Originated, fee, receivedAt, value} = transaction;
                    transactions.push({
                        hash: hash,
                        to: to,
                        from: from,
                        data: data,
                        isL1Originated: isL1Originated,
                        fee: fee,
                        feeInEth: ethers.utils.formatUnits(fee, 'ether'),
                        receivedAt: receivedAt,
                        transfers: [],
                        // ethValue: parseInt(ethResponse),
                        value: value,
                    });
                });

                if (response.data.links.next === '') break;
                url = 'https://block-explorer-api.mainnet.zksync.io/' + response.data.links.next;
            } else {
                console.error('Error occurred while retrieving transactions.');
                break;
            }
        } catch (error) {
            console.error('Error occurred while making the request:', error);
            break;
        }
    }

    // const transfers = await getAllTransfers(address);

    // transfers.forEach((transfer) => {
    //     if (transfer.token === null) return;
    //     transactions.forEach((transaction) => {
    //         if (transaction.hash === transfer.transactionHash) {
    //             transaction.transfers.push(transfer);
    //         }
    //     });
    // });


    // await assignTransferValues(transactions);

    // await initDB(dbConfig)
    // await update("zkTransactions", {
    //     address: address,
    //     data: JSON.stringify(transactions)
    // })

    return transactions;
};

module.exports = { getTransactionsList };