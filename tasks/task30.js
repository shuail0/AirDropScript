/*

    BigInt mint nft
        1.mintNft

*/


const BigInt = require('../protocol/zksync/nft/bigint/bigint.js');
const { floatToFixed } = require('../base/utils.js');
const ethers = require('ethers');

module.exports = async (params) => {
    const {wallet} = params;
    const bi = new BigInt();
    let tx = await bi.mintNft(wallet);
    console.log('mint成功, txHash:', tx.transactionHash)

}