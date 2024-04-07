const ccxt = require('ccxt');
const { sleep } = require('../../base/utils');

class Binance {
    constructor(apiKeys) {
        this.exchange = new ccxt.binance(apiKeys)
    }
    // 查询账户余额
    async getAssetBalance() {
        return this.exchange.sapiV3PostAssetGetUserAsset();
    }
    // 提现
    async withdraw(walletAddress, tag, currency, amount, chain) {
        while (true) {

            const balance = await this.getAssetBalance();  // （取现货账户可用余额
            const freeBalance = parseFloat(balance.find(item => item.asset === currency)?.free || 0);  // 获取可用余额，如果余额可用则返回余额，如果无法获取返回0
            console.log(`可用 ${currency} 余额：${freeBalance}`);

            if (freeBalance >= parseFloat(amount)) {
                console.log(`可用 ${currency} 余额：${freeBalance},正在将 ${amount} ${currency} 提现到钱包地址 ${walletAddress} 提币链 ${chain}`);
                const timestamp = Date.now();
                const params = {
                    coin: currency,
                    network: chain,
                    address: walletAddress,
                    amount: amount.toString(),
                    timestamp: timestamp
                };

                if (tag !== null) {
                    params['addressTag'] = tag;
                }

                let withdrawal = await this.exchange.sapiPostCapitalWithdrawApply(params);
                console.log("提现结果：", withdrawal);
                return withdrawal

            } else {
                // throw new Error("Not enough balance for withdrawal.");
                console.log(`可用 ${currency} 余额不足，当前可用余额：${freeBalance}，提现金额：${amount}，等待10分钟后重试`);
                await sleep(10);
            }
        }

    }
    // 查询冲币地址
    async getDepositAddress(currency, chain=null) { 
        const timestamp = Date.now();
        return this.exchange.sapiGetCapitalDepositAddress({ coin: currency, network: chain, timestamp: timestamp});
    }
    // 查询子账户列表
    async getSubAccountList() {
        const timestamp = Date.now();
        const subAcctInfo = await this.exchange.sapiGetSubAccountList({ timestamp: timestamp});
        if (subAcctInfo.success) {
            return subAcctInfo.subAccounts;
        } else {
            return [];
        }
    }
    // 查询子账户现货账户余额
    async getSubaccountAssetBalances(subAcctEmail) {
        const timestamp = Date.now();
        const assetInfo = await this.exchange.sapiV3GetSubAccountAssets({ email: subAcctEmail, timestamp: timestamp});
        if (assetInfo.success === true) {
            return assetInfo.balances;
        } else {
            return [];
        }
    }
    // 子母账户现货账户互相划转
    async subAssetTransfer(fromEmail, toEmail,fromAccountType, toAccountType, currenc, amount) {
        const timestamp = Date.now();
        const params = {
            fromEmail: fromEmail,
            toEmail: toEmail,
            fromAccountType: fromAccountType,
            toAccountType: toAccountType,
            asset: currenc,
            amount: amount,
            timestamp: timestamp
        }
        return this.exchange.sapiPostSubAccountUniversalTransfer(params);
    }


}

module.exports = Binance;