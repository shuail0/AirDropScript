/**
 * tasks000: zkfox交互程序
 * 1. 查询weth数量，存入全部WETH
 * 2. 查询fWETH数量
 * 3. 取出WETH
 */

const ZkFox = require('../protocol/zksync/lending/zkfox/zkfox.js');
const UnWrappedETH = require('../protocol/zksync/other/unWrappedETH/unWrappedETH')
const { fetchToken, getBalance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require('../base/utils.js')
const ethers = require('ethers');
const { getHashedL2ToL1Msg } = require('zksync-web3/build/src/utils.js');



module.exports = async (params) => {
    const { wallet } = params
    const ETHAddress = '0x0000000000000000000000000000000000000000';
    const wETHAddress = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
    const fWethAddr = '0x129F73e23dCC7caec19977044fC7aED29d4f23D2';

    const zkfox = new ZkFox();
    const unWrappedETH = new UnWrappedETH();

    // 查询代币信息
    const wETH = await fetchToken(wETHAddress, wallet);

    // //查询账户WETH余额
    let wethBalance, ethBalance, depositAmoutnt;
    wethBalance = await getBalance(wallet, wETHAddress);
    console.log('weth余额：', fixedToFloat(wethBalance, 18), '开始检查授权...');
    if (fixedToFloat(wethBalance, 18) == 0) {
        ethBalance = fixedToFloat(await getBalance(wallet, ETHAddress));
        console.log('账户ETH余额：', ethBalance);
        // 设定随机金额
        const minAmount = ethBalance * 0.2  // 最小交易数量
        const maxAmount = ethBalance * 0.7 // 最大交易数量
        depositAmoutnt = floatToFixed(getRandomFloat(minAmount, maxAmount));
        console.log('随机交易数量', fixedToFloat(depositAmoutnt), ' 将ETH转换为WETH');
        const tx = await unWrappedETH.depositEth(wallet, depositAmoutnt);
        console.log('交易成功txHash：', tx.transactionHash)

    } else {
        depositAmoutnt = wethBalance;
    }

    console.log('随机交易数量', fixedToFloat(depositAmoutnt), ' 开始交易')
    await checkApprove(wallet, wETHAddress, fWethAddr, depositAmoutnt);

    let tx = await zkfox.deposit(wallet, depositAmoutnt);
    console.log('transaction successful:', tx.transactionHash);

    await sleep(2);

    // 查询账户fWeth余额
    const fWethBalance = await getBalance(wallet, zkfox.fWethAddr);
    console.log('fWeth余额：', fixedToFloat(fWethBalance), '开始取出ETH')

    tx = await zkfox.withdraw(wallet, fWethBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

    // 查询账户WETH余额
    wethBalance = await getBalance(wallet, wETHAddress);
    console.log('weth余额：', fixedToFloat(wethBalance, 18), '.');
    if (fixedToFloat(wethBalance, 18) > 0) {
        console.log('WETH 余额大于0，需要转换为ETH');
        const tx = await unWrappedETH.withdrawEth(wallet, wethBalance);
        console.log('交易成功txHash：', tx.transactionHash)
    }
};