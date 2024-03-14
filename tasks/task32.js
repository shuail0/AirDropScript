
/*
    链上每日祈福
        1. mint
*/

const chainPray = require('../protocol/zksync/nft/chainpray/chainPray.js');
const ethers = require('ethers');

module.exports = async (params) => {
    const {wallet} = params;
    const cp = new chainPray();
    console.log('开始mint');
    let tx = await cp.mint(wallet);
    console.log('交易成功 txHash:', tx.transactionHash)

}

