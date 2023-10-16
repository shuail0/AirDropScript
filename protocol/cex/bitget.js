const ccxt = require('ccxt');

class Bitget {
    constructor(apiKeys) {
        this.exchange = new ccxt.bitget(apiKeys)
    };
    async withdraw(walletAddress, tag = null, currency = null, amount = null, chain = null) {
        // console.log(this.exchange)
        // 检查资金账户可用余额
        let freeBalance = await this.exchange.fetch_free_balance();
        console.log(`可用 ${currency} 余额：${freeBalance[currency]}`);

        if (freeBalance[currency] >= amount) {
            // 提现
            console.log(`正在将 ${amount} ${currency} 提现到钱包地址 ${walletAddress} 提币链 ${chain}`);
            const params = {
                coin: currency,
                chain: chain,
                address: walletAddress,
                amount: amount.toString()
            };

            if (tag !== null) {
                params.tag = tag;
            }

            let withdrawal = await this.exchange.privateSpotPostWalletWithdrawalV2(params);
            console.log("提现结果：", withdrawal);


        } else {
            console.log("余额不足，无法提现");
        }
    };

    async getSubAccountSpotAssetBalances() {
        const subBalances = await this.exchange.privateSpotPostAccountSubAccountSpotAssets()
        if (subBalances.msg === 'success') {
            return subBalances.data
        }


    };

    /**
     * 获取ApiKey信息
     * @returns 
     */
    async getAccountInfo() {
        return await (await this.exchange.privateSpotGetAccountGetInfo())['data']
    };



    /**
     * 转入/转出账户UID必须存在母子关系，没有母子关系的操作会返回异常
     * @param {*} fromType 转出账户类型
     * @param {*} toType 转入账户类型
     * @param {*} amount 划转金额
     * @param {*} currenc 划转币种
     * @param {*} clientOid 用户自定义ID，唯一键，幂等控制
     * @param {*} fromUserId 转出账户UID
     * @param {*} toUserId 转入账户UID
     * @returns 
     * fromType, toType:
        spot 接受转入转出多个币种
        mix_usdt 只接受转入转出USDT
        mix_usd 混合合约账户，只接受转入转出保证金币种，如BTC, ETH, EOS, XRP, USDC等
        mix_usdc 只接受转入转出USDC margin_cross 接受转入转出多个币种 margin_isolated 接受转入转出多个币种
     */
    async subTransfer(fromType, toType, amount, currenc, clientOid, fromUserId, toUserId) {
        return await this.exchange.privateSpotPostWalletSubTransfer({ fromType: fromType, toType: toType, amount: amount, coin: currenc, clientOid: clientOid, fromUserId: fromUserId, toUserId: toUserId });
    };

    /**
     * 归集所有子账户的资产到主账户中
     * @param {*} currenc  要归集的资产名 如ETH
     */
    async assetTransferFromSubAccountToMainAccounAll(currenc) {
        const clientOid = (Math.floor(Date.now() / 1000)).toString();  // 使用当前时间戳作为clientOid
        const parentId = await (await this.getAccountInfo())['parentId'];  // 获取母账户ID
        const subBalances = await this.getSubAccountSpotAssetBalances();  // 获取所有子账户现货资产
        for (const subBalance of subBalances) {
            const currencItem = subBalance.spotAssetsList.find(item => item.coinName === currenc);
            if (currencItem) {
                console.log(`子账户：${subBalance.userId} ,${currenc}可用余额：${currencItem.available}. 开始将余额划转至主账户`);
                try {
                    await this.subTransfer('spot', 'spot', currencItem.available, currenc, clientOid, subBalance.userId, parentId);
                    console.log(`子账户：${subBalance.userId} ,划转成功，划转金额：${currencItem.available}`);
                    // 等待1秒再进行下一个请求
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.log(`子账户：${currenc.userId} 划转失败，原因：${error}`);
                };

            } else {
                console.log(`子账户：${subBalance.userId} ,没有${currenc}.`);
            }

        };
    };
}

module.exports = { Bitget }
