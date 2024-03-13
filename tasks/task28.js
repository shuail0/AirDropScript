/*
    zkdx交互程序
        1. mint fUsdt

*/
const Zkdx = require('../protocol/zksync/dex/zkdx/zkdx.js');

module.exports = async (params) => {
    const {wallet} = params;
    const zkdx = new Zkdx();
    console.log('开始mint fUsdt');
    let tx = await zkdx.mintFUsdt(wallet);
    console.log('交易成功 txHash:', tx.transactionHash)

}

