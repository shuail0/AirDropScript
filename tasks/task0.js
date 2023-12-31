/**
 * tasks10 : velocore交互程序：
 *  1.传入wallet类。
 *  2.查询账户ETH余额。
 *  3.在指定范围随机将一定数量的ETH兑换为USDC
 *  4.将获得的USDC兑换为ETH。
 */


const ethers = require('ethers');
const zksync = require('zksync-web3');

module.exports = async (params) => {


    const { wallet } = params;
    const { providerL1: ethprovider } = wallet;

    // 查询账户余额
    console.log('开始查询账户L1 ETH余额.')
    const ethBalance = await wallet.getBalanceL1();
    console.log(`成功查询账户ETH余额，余额：${ethers.utils.formatEther(ethBalance).toString()}`);
    // 计算预留gas
    const gasPrice = parseFloat(ethers.utils.formatUnits(await ethprovider.getGasPrice(), 'gwei'));
    console.log('gasPrice:', gasPrice);
    const gasLimit = ethers.BigNumber.from(149210);
    const gasPriceMultiplier = 1.8;
    const gasPriceInteger = ethers.utils.parseUnits((gasPrice * gasPriceMultiplier).toFixed(4), 'gwei');
    const bridgeGasFee = gasLimit.mul(gasPriceInteger);


    console.log('预留gas：', ethers.utils.formatEther(bridgeGasFee).toString())
    // 检查余额是否充足
    if (bridgeGasFee.gt(ethBalance)) {
        throw new Error('当前账户余额小于所需支付的Gas费用');
    }
    const bridgeAmount = ethBalance.sub(bridgeGasFee);


    // 存入资金（跨链）
    const deposit = await wallet.deposit({
        token: zksync.utils.ETH_ADDRESS,
        amount: bridgeAmount,
    });

    // 可以用事物句柄跟踪其状态
    const ethereumTxReceipt = await deposit.waitL1Commit();
    console.log(`主网交易成功，哈希: ${ethereumTxReceipt.transactionHash}，等待L2确认...`)

    // // 等待zkSync处理存款
    const depositRecript = await deposit.wait();
    console.log(`depositRecript: ${depositRecript}`)

    // 查询L2余额
    console.log('开始查询L2余额...');
    const tokenBalance = ethers.utils.formatEther(await wallet.getBalance())
    console.log(`查询成功，L2余额：${tokenBalance}，跨链结束！`);

};
