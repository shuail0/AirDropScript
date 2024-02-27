/**
 * tasks000: zkfox交互程序
 * 1. 查询weth数量，存入全部WETH
 * 2. 查询fWETH数量
 * 3. 取出WETH
 */

const ZkFox = require('../protocol/zksync/lending/zkfox/zkfox.js');
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

     // 查询代币信息
     const wETH = await fetchToken(wETHAddress, wallet); 

    //查询账户WETH余额

    const wethBalance = await getBalance(wallet, wETHAddress);
    console.log('weth余额：', fixedToFloat(wethBalance,18), '开始检查授权...');
    await checkApprove(wallet, wETHAddress, fWethAddr, wethBalance);

    
        
    let tx = await zkfox.deposit(wallet, wethBalance);
    console.log('transaction successful:',tx.transactionHash);

    await sleep(2);

    //查询账户fWeth余额
    const fWethBalance = await getBalance(wallet, zkfox.fWethAddr);
    console.log('fWeth余额：', fWethBalance, '开始取出ETH')

    tx = await zkfox.withdraw(wallet, fWethBalance);
    console.log('交易成功 txHash:', tx.transactionHash)
};