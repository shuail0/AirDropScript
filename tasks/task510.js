/*
    
    查询账户的wETH余额，如果大于0，则转为ETH
*/


const { fetchToken, getErc20Balance, tokenApprove, checkApprove } = require('../base/coin/token.js')
const { floatToFixed, fixedToFloat, sleep, getRandomFloat, saveLog } = require('../base/utils.js')
const ethers = require('ethers');
const RPC = require('../config/RpcConfig.json');
const coinAddress = require('../config/tokenAddress.json').Mode
const Molend = require('../protocol/mode/lending/molend/molend.js');
const amWeth = "0x4080Ec9B7159FE74e5E4f25304a8aa8293815f16";

const ABI = [
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "uint256",
                "name": "wad",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

module.exports = async (params) => {
    const { pky } = params;
    const wallet = new ethers.Wallet(pky, new ethers.getDefaultProvider(RPC.Mode));
    const molend = new Molend(wallet);
    // 查询账户余额
    // 查询wETH余额
    const wETH = await fetchToken(coinAddress.wETH, wallet);
    const wETHBalance = await getErc20Balance(wallet, wETH.address);
    console.log('账户wETH余额:', fixedToFloat(wETHBalance, wETH.decimal));
    if (wETHBalance.gt(floatToFixed(0))) {
        console.log('wETH余额大于0,转为ETH');
        const wETHContract = new ethers.Contract(wETH.address, ABI, wallet);
        const gasPrice = (await wallet.provider.getGasPrice()).mul(15).div(100); // 减少50%的gasPrice
        const response = await wETHContract.withdraw(wETHBalance, { gasPrice });
        const tx = await response.wait();
        console.log('交易成功,hash：', tx.transactionHash);
    }
}