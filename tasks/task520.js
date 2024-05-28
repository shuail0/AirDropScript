/**
 * tasks520: cog交互程序  
 * 1. 查询账户wETH余额信息
 * 2. 如无wETH，则将账户中5%-20%的ETH兑换为wETH
 * 3. 再次查询账户wETH余额，并将账户中的wETH全部存入到cog中
 * 4. 把账户中所有wETH兑换回ETH
 * 5. 实现功能：add_collateral; remove_collateral; user_share_collateral;
 */

const ethers = require("ethers");
const RPC = require('../config/RpcConfig.json');
const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, getRandomFloat, sleep } = require("../base/utils.js");
const CogFinance = require('../protocol/scroll/lending/cog/cog.js');
const coinAddress = require('../config/tokenAddress.json').Scroll




module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Scroll));
    const cogfinance = new CogFinance(wallet);
    const ABI = [
        {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {"inputs":[
            {"internalType":"uint256",
            "name":"wad",
            "type":"uint256"}
            ],
            "name":"withdraw",
            "outputs":[],
            "stateMutability":"nonpayable",
            "type":"function"
        }

    ] 
    // // 查询代币信息
    const wETH = await fetchToken(coinAddress.WETH, wallet);
    

    // 查询wETH余额
    const wETHBalance = await getErc20Balance(wallet, wETH.address);
    console.log('账户wETH余额:', fixedToFloat(wETHBalance, wETH.decimal));

    if (wETHBalance.lt(floatToFixed(0.0001))) {
        console.log('wETH余额不足,买入wETH');
        const ethBalance = fixedToFloat(await wallet.getBalance());
        console.log('账户ETH余额：', ethBalance);
        // // // 设定随机金额
        const minAmount = ethBalance * 0.05  // 最小交易数量
        const maxAmount = ethBalance * 0.2 // 最大交易数量
        // // 随机交易数量
        let amount = floatToFixed(getRandomFloat(minAmount, maxAmount));
        console.log('随机交易数量', fixedToFloat(amount), ' 开始交易');
        const wETHContract = new ethers.Contract(wETH.address, ABI, wallet);
        const response = await wETHContract.deposit({ value: amount });
        const tx = await response.wait();
        console.log('交易成功,hash：', tx.transactionHash);
    };

    await sleep(2);

    wETHBalance = await getErc20Balance(wallet, wETH.address);
    console.log('账户wETH余额:', fixedToFloat(wETHBalance, wETH.decimal),'开始检查授权...');
    await checkApprove(wallet, wETH.address, cogfinance.cogPairContractAddr, wETHBalance);
    let tx = await cogfinance.supplyToken(wallet, wETHBalance);
    console.log('交易成功 txHash:', tx.transactionHash)

    
    const sleepTime = getRandomFloat(1, 5);
    console.log('随机暂停：', sleepTime, '分钟');
    await sleep(sleepTime);

    // 赎回资产
    const withdrawAmount = await cogfinance.getCollateralAmount(wallet);
    console.log('可提取wETH余额:', fixedToFloat(withdrawAmount, wETH.decimal), '开始取出...');
    tx = await cogfinance.withdrawToken(wallet, withdrawAmount);
    console.log('交易成功，hash：', tx.transactionHash)

    await sleep(0.8);

    //将wETH换回ETH；
    wETHBalance = await getErc20Balance(wallet, wETH.address);
    console.log('wETH余额', fixedToFloat(wETHBalance, wETH.decimal), ' 开始换回ETH...');
    const wETHContract = new ethers.Contract(wETH.address, ABI, wallet);
    const response = await wETHContract.withdraw(wETHBalance);
    tx = await response.wait();
    console.log('交易成功,hash：', tx.transactionHash)


    
};