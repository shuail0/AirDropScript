const okxWithdraw = async (exchange, walletAddress, tag, currency, amount, chain) => {
    const network = chain.split('-').pop();
    const currencies = await exchange.fetchCurrencies();
    const withdrawalFee = currencies[currency].networks[network].fee;
    const balance = await exchange.privateGetAssetBalances();  // 获取资金账户余额
    const freeBalance = parseFloat(balance.data.find(item => item.ccy === 'ETH')?.availBal || 0);  // 获取可用余额，如果余额可用则返回余额，如果无法获取返回0
    console.log(`可用 ${currency} 余额：${freeBalance}`);

    if (freeBalance >= (parseFloat(amount) + parseFloat(withdrawalFee))) {
        console.log(`正在将 ${amount} ${currency} 提现到钱包地址 ${walletAddress} 提币链 ${chain}`);
        const params = {
            ccy: currency,
            amt: amount,
            dest: 4,
            toAddr: walletAddress,
            fee: withdrawalFee,
            chain: chain
        };
        if (tag) {
            params.toAddr = `${walletAddress}:${tag}`;
        }

        const withdrawal = await exchange.privatePostAssetWithdrawal(params);
        console.log("提现结果：", withdrawal);

    } else {
        console.log("Not enough balance for withdrawal.");
    }
};

module.exports = { okxWithdraw };
