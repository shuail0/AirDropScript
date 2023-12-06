const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// 替换为你的 Alchemy WebSocket URL
// https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl
const ALCHEMY_WSS_URL = 'wss://eth-mainnet.alchemyapi.io/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl';
const ALCHEMY_HTTP_URL = 'https://eth-mainnet.alchemyapi.io/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl';
const RECONNECT_INTERVAL = 3000; // 重连间隔时间（毫秒）
const NUM_BLOCKS = 8640; // 初始获取的区块数量
const BATCH_SIZE = 40; // 每个批次处理的区块数量
const csvFilePath = '../data/gasPrices.csv';

const httpProvider = new ethers.providers.JsonRpcProvider(ALCHEMY_HTTP_URL);

function initializeCSVFile() {
    if (!fs.existsSync(csvFilePath)) {
        const csvHeader = 'Timestamp, Block Number, Base Fee (Gwei)\n';
        fs.writeFileSync(csvFilePath, csvHeader);
        console.log('CSV file initialized.');
    } else {
        console.log('CSV file already exists.');
    }
}

// 使用 papaparse 读取 CSV 文件并返回最后一个区块号
function getLastBlockNumberFromCSV() {
    if (fs.existsSync(csvFilePath)) {
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        const parsed = Papa.parse(fileContent, { header: true });
        const lastRow = parsed.data[parsed.data.length - 2]; // 获取倒数第二行（最后一行可能为空）
        return lastRow ? parseInt(lastRow['Block Number']) : 0;
    }
    return 0;
}

async function fetchBlockData(blockNumber) {
    try {
        const block = await httpProvider.getBlock(blockNumber);
        if (block && block.baseFeePerGas) {
            const baseFee = ethers.utils.formatUnits(block.baseFeePerGas, 'gwei');
            const timestamp = new Date(block.timestamp * 1000).toISOString();
            console.log(`Fetched block ${blockNumber}: Base Fee = ${baseFee} Gwei`);
            return `${timestamp}, ${blockNumber}, ${baseFee}\n`;
        }
    } catch (error) {
        console.error(`Error fetching block ${blockNumber}:`, error);
    }
    return '';
}

async function fetchAndAppendBlocksInBatches(fromBlock, toBlock) {
    for (let i = fromBlock; i <= toBlock; i += BATCH_SIZE) {
        const batchToBlock = Math.min(i + BATCH_SIZE - 1, toBlock);
        const blockNumbers = Array.from({ length: batchToBlock - i + 1 }, (_, index) => i + index);

        const blockDataPromises = blockNumbers.map(blockNum => fetchBlockData(blockNum));
        const blockData = await Promise.all(blockDataPromises);
        fs.appendFileSync(csvFilePath, blockData.join(''));
    }
}

async function connectWebSocket() {
    initializeCSVFile();
    const currentBlockNumber = await httpProvider.getBlockNumber();
    const lastBlockNumberInCSV = getLastBlockNumberFromCSV();

    if (lastBlockNumberInCSV < currentBlockNumber - NUM_BLOCKS) {
        const startBlockNumber = Math.max(currentBlockNumber - NUM_BLOCKS, 0);
        console.log(`Fetching missing data from block ${startBlockNumber} to ${currentBlockNumber}`);
        await fetchAndAppendBlocksInBatches(startBlockNumber, currentBlockNumber);
    } else {
        console.log('Historical data is up-to-date.');
    }

    const wsProvider = new ethers.providers.WebSocketProvider(ALCHEMY_WSS_URL);

    wsProvider._websocket.on('close', async () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    });

    wsProvider.on('block', (blockNumber) => {
        wsProvider.getBlock(blockNumber).then((block) => {
            const baseFee = ethers.utils.formatUnits(block.baseFeePerGas, 'gwei');
            const timestamp = new Date().toISOString();
            console.log(`New block ${blockNumber}: Base Fee = ${baseFee} Gwei`);
            const data = `${timestamp}, ${blockNumber}, ${baseFee}\n`;
            fs.appendFileSync(csvFilePath, data);
        }).catch(err => {
            console.error(`Error fetching new block ${blockNumber}:`, err);
        });
    });

    console.log('Subscribed to new Ethereum blocks.');
}

connectWebSocket();