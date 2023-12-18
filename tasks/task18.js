/**
 * tasks8: tator 存ETH取ETH程序
 * 1. 将20%-30% 的ETH 随机存入一个池子
 * 2. 查询ETH数量
 * 3. 取出ETH
 */

const Tarot = require("../protocol/zksync/other/taort/tarot.js");
const { fetchToken, getBalance, tokenApprove, checkApprove } = require("../base/coin/token.js");

const {
    floatToFixed,
    fixedToFloat,
    getRandomFloat,
    sleep,
} = require("../base/utils.js");
const ethers = require("ethers");

module.exports = async (params) => {
    const { wallet } = params;
    const ETHAddress = "0x0000000000000000000000000000000000000000";

    const tarot = new Tarot();
    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log("账户ETH余额：", ethBalance);
    // // 设定随机金额
    const minAmount = ethBalance * 0.2; // 最小交易数量
    const maxAmount = ethBalance * 0.3; // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));

    const poolTokens = [
        "0x563cb1233CaD5f996E281338D54bfC282Efbc8db",
        "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    ];
    const randomIndex = Math.floor(Math.random() * poolTokens.length);
    const poolToken = poolTokens[randomIndex];
    console.log(
        "随机交易数量",
        amount.toString(),
        " 开始存入ETH, PoolToken:",
        poolToken
    );

    let tx = await tarot.supplyEth(wallet, poolToken, amount);
    console.log("交易成功 txHash:", tx.transactionHash);

    await sleep(2);
    const poolTokenBalance = await getBalance(wallet, poolToken);
    console.log( "poolToken余额：",  fixedToFloat(poolTokenBalance), "开始检查授权..." );
    await checkApprove(wallet, poolToken, tarot.routerAddr, poolTokenBalance);

    tx = await tarot.withdrawEth(wallet, poolToken, poolTokenBalance);
    console.log("交易成功 txHash:", tx.transactionHash);
};