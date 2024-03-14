/*
    rubyScore投票
        1. 投票
*/

const rubyScore = require('../protocol/zksync/other/rubyScore/rubyScore.js');
const ethers = require('ethers');

module.exports = async (params) => {
    const {wallet} = params;
    const rs = new rubyScore();
    console.log('开始投票');
    let tx = await rs.vote(wallet);
    console.log('交易成功 txHash:', tx.transactionHash)

}




