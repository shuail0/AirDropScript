const ccxt = require("ccxt");

class OKX {
    constructor(apiKeys) {
        this.exchange = new ccxt.okx(apiKeys)
    }

    async withdraw(walletAddress, tag, currency, amount, chain) {
        const network = chain.split('-').pop();
        const currencies = await this.exchange.fetchCurrencies();
        const withdrawalFee = currencies[currency].networks[network].fee;
        const balance = await this.exchange.privateGetAssetBalances();  // 获取资金账户余额
        const freeBalance = parseFloat(balance.data.find(item => item.ccy === currency)?.availBal || 0);  // 获取可用余额，如果余额可用则返回余额，如果无法获取返回0
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

            const withdrawal = await this.exchange.privatePostAssetWithdrawal(params);
            console.log("提现结果：", withdrawal);

        } else {
            console.log("Not enough balance for withdrawal.");
        }
    };

    // 查询冲币地址
    async getDepositAddress(currency, chain) {
        const response = await this.exchange.privateGetAssetDepositAddress({ ccy: currency });
        const dataArray = response.data;
        const filteredData = dataArray.filter(item => item.chain === chain);
        return filteredData
        // return dataArray
    };

    // 查询子账户列表
    async getSubAccountList(limit = 100) {
        return this.exchange.privateGetUsersSubaccountList({ limit: limit });
    }

    // 查询子账户资金账户余额
    async getSubacountAssetBalances(subAcct, currenc = undefined) {
        return (await this.exchange.privateGetAssetSubaccountBalances({ subAcct: subAcct, ccy: currenc }))['data'];
    };

    /**
     * 账户资金划转
     * @type: 划转类型（默认是0）
     *      0：账户内划转
     *      1：母账户转子账户(仅适用于母账户APIKey)
     *      2：子账户转母账户(仅适用于母账户APIKey)
     *      3：子账户转母账户(仅适用于子账户APIKey)
     *      4：子账户转子账户(仅适用于子账户APIKey，且目标账户需要是同一母账户下的其他子账户。子账户主动转出权限默认是关闭的，权限调整参考 设置子账户主动转出权限。)
     * 
     * @ccy : 	划转币种，如 USDT
     * 
     * @amt : 划转数量
     * 
     * @from ： 转出账户
     *      6: 资金账户
     *      18: 交易账户
     * 
     * @to ： 转出账户
     *      6: 资金账户
     *      18: 交易账户
     * 
     * @subAcct : 子账户名称， 当type为1/2/4时，该字段必填
     */
    async assetTransfer(currenc, amount, type = 0, subAcct = undefined, from = 6, to = 6) {
        return await this.exchange.privatePostAssetTransfer({ type: type, ccy: currenc, amt: amount, from: from, to: to, subAcct: subAcct })
    };


    /**
     * 从子账将资金归集到主账户
     * @param {*} subAcct - 子账户名称
     * @param {*} currenc - 需要归集的资金
     * @param {*} amount - 归集数量，默认为0 ，0 是归集所有可用余额
     * @param {*} from - 转出账户，6为资金账户， 18为交易账户
     * @param {*} to - 转入账户， 6为资金账户， 18为交易账户
     * @returns 
     */
    async assetTransferFromSubAccountToMainAccoun(subAcct, currenc, amount = 0, from = 6, to = 6) {
        // 查询可用余额
        const availBal = Number(await (await this.getSubacountAssetBalances(subAcct, currenc))[0]['availBal']);
        if (availBal === 0) {
            throw new Error(`账户余额为0`);

        } else if (availBal < Number(amount)) {
            throw new Error(`${currenc}余额不足，当前可用余额:${availBal}, 划转金额${amount}`);
        };
        if (Number(amount) === 0) {
            amount = availBal;
        };
        return await this.assetTransfer(currenc, amount, 2, subAcct, from, to);

    };

    /**
     * 批量将子账户资金归集到主账户
     * @param {*} currenc 
     * @param {*} amount 
     * @param {*} from 
     * @param {*} to 
     * @returns 
     */
    async assetTransferFromSubAccountToMainAccounAll(currenc) {
        // 获取子账户列表
        const subAccts = await this.getSubAccountList();
        const transferInfos = [];
        for (const subAcct of subAccts) {
            // 遍历划转
            try {
                const transferInfo = await this.assetTransferFromSubAccountToMainAccoun(subAcct.subAcct, currenc, 0, 6, 6);  // 注意这里添加了 await
                transferInfos.push(transferInfo);
                console.log(`子账户：${subAcct['subAcct']} 划转成功，返回信息：${JSON.stringify(transferInfo)}`); // 使用 JSON.stringify 来查看对象
                // 等待1秒再进行下一个请求
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`子账户：${subAcct['subAcct']} 划转失败，失败原因：${error}`);
            };
        }
        return transferInfos;
    };

}



module.exports = OKX;
