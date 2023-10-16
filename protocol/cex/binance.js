const binanceWithdraw = async (exchange, walletAddress, tag = null, currency = null, amount = null, chain = null) => {
    // 检查资金账户余额
    let balance = await exchange.sapiV3PostAssetGetUserAsset();
    let balanceObj = {};
    balance.forEach(asset => {
        balanceObj[asset.asset] = asset;
    });
    
    // 获取可用余额
    let freeBalance = parseFloat(balanceObj[currency].free);
    console.log(`可用 ${currency} 余额：${freeBalance}`);

    if (freeBalance >= amount) {
        // 提现
        console.log(`正在将 ${amount} ${currency} 提现到钱包地址 ${walletAddress} 提币链 ${chain}`);
        const timestamp = Date.now();
        const params = {
            coin: currency,
            network: chain,
            address: walletAddress,
            amount: amount.toString(),
            timestamp: timestamp
        };

        if (tag !== null) {
            params.addressTag = tag;
        }
        
        let withdrawal = await exchange.sapiPostCapitalWithdrawApply(params);
        console.log("提现结果：", withdrawal);

        // 检查提现状态
        await new Promise(resolve => setTimeout(resolve, 5000)); // 等待 5 秒以获取更新状态
        let status = await exchange.sapiGetCapitalWithdrawHistory({
            withdrawOrderId: withdrawal.id,
            timestamp: Date.now()
        });
        console.log("提现状态：", status);
    } else {
        console.log("余额不足，无法提现");
    }
}

module.exports = { binanceWithdraw};
