/**
 * tasks8: impermax 存ETH取ETH程序
 * 1. 将20%-30% 的ETH 随机存入一个池子
 * 2. 查询ETH数量
 * 3. 取出ETH
 */

const Impermax = require("../protocol/zksync/other/impermax/impermax.js");
const {
    fetchToken,
    getBalance,
    tokenApprove,
    checkUSDCApprove
} = require("../base/coin/token.js");
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

    const impermax = new Impermax();
    // // 查询账户余额
    const ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
    console.log("账户ETH余额：", ethBalance);
    // // 设定随机金额
    const minAmount = ethBalance * 0.2; // 最小交易数量
    const maxAmount = ethBalance * 0.3; // 最大交易数量
    // 随机交易数量
    let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));

    const poolTokens = [
        "0x893afbe6fb07b62525171332e91e1a069775626f",
        "0xf1398c80f8856937a69609711fdf9a11d1e25d82",
        "0x9b223d244dafd1e8053c2fa0d583b50a06446452",
        "0x01997e620bbe8228df9a8fb2d8ca7d05ff8a231b",
        "0xa5377dccb76fd32fd93c72a12ff6f1e3907ae8e1",
        "0x304847ddbf68948655b0209c00e32a0923ef41b6",
        "0x41b737ef7c9271ebe9c9da106745cf99b379ab7e",
        "0xa5fdc2b84b6cfa5c1d80c6d73c1bb76660524c19",
        "0x93e47ca43a037e2474cd44185f785bbb896bec8f",
        "0x15d2fc4669ee71caf98b3e5bac17146c68e12f4a",
    ];
    const randomIndex = Math.floor(Math.random() * poolTokens.length);
    const poolToken = poolTokens[randomIndex];
    console.log(
        "随机交易数量",
        amount.toString(),
        " 开始存入ETH, PoolToken:",
        poolToken
    );

    let tx = await impermax.supplyEth(wallet, poolToken, amount);
    console.log("交易成功 txHash:", tx.transactionHash);

    await sleep(2);
    const poolTokenBalance = await getBalance(wallet, poolToken);
    console.log("poolToken余额：", fixedToFloat(poolTokenBalance), "开始检查授权impermaxrouter合约使用poolToken");
    await checkUSDCApprove(wallet, poolToken, impermax.routerAddr, poolTokenBalance);

    // 授权impermaxrouter合约使用poolToken  
    // await tokenApprove(wallet, poolToken, impermax.routerAddr, poolTokenBalance);

    // console.log("授权成功,开始取出ETH");


    tx = await impermax.withdrawEth(wallet, poolToken, poolTokenBalance);
    console.log("交易成功 txHash:", tx.transactionHash);
};
