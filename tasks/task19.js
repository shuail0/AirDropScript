/**
 * tasks8: rhino mintNFT程序
 * 1. 最排名前30%的账户执行mintNFT
 */

const Rhino = require("../protocol/zksync/dex/rhino/rhino.js");
const { fetchToken, getBalance, tokenApprove } = require("../base/coin/token.js");

const {
    floatToFixed,
    fixedToFloat,
    getRandomFloat,
    sleep,
} = require("../base/utils.js");
const ethers = require("ethers");

module.exports = async (params) => {
    const { wallet } = params;

    const rhino = new Rhino();
    // mint
    console.log("开始mint");
    let tx = await rhino.mintExplorerNFT(wallet);
    console.log("Mint成功 txHash:", tx.transactionHash);
};