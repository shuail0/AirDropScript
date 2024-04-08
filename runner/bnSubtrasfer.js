/**
 * 多交易所提币程序
 * 具体执行逻辑参照task52.js
 */


const Binance = require('../protocol/cex/binance');
const { loadApiKeys } = require('../protocol/cex/cexUtils');
const apiKey = loadApiKeys('binance')


const bn = new Binance(apiKey);
(async () => {

    const mainAccEmail = '707571@qq.com'; // 主账户邮箱
    const currenc = 'ETH';  // 需要归集的币种

    const subAcctList = await bn.getSubAccountList();
    console.log(subAcctList);

    while (true) {

    for (const subAcct of subAcctList) {
        // 遍历划转
        try {
            // 查询余额
            let subAccBalance = await bn.getSubaccountAssetBalances(subAcct.email);
            let currencBalanceInfo = subAccBalance.find(item => item.asset === currenc);
            let freeBalance = currencBalanceInfo ? Number(currencBalanceInfo.free) : 0;
            console.log(`子账户：${subAcct.email} ${currenc} 余额：${freeBalance}`);
            if (freeBalance > 0 ) {
                console.log(`子账户：${subAcct.email} ${currenc} 余额大于0，开始划转`);
                const transferInfo = await bn.subAssetTransfer(subAcct.email, mainAccEmail, 'SPOT', 'SPOT', currenc, freeBalance);
                console.log(`子账户：${subAcct.email} 划转成功，返回信息：${JSON.stringify(transferInfo)}`); // 使用 JSON.stringify 来查看对象
            }
        } catch (error) {
            console.log(`子账户：${subAcct.email} 划转失败，失败原因：${error}`);
        };
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // 等待30秒再进行下一轮划转
    console.log('本轮操作完成，等待30秒再进行下一轮划转');
    await new Promise(resolve => setTimeout(resolve, 30000));

    }
})();