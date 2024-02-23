/**
 *  项目名称： tarot Finance
 * 项目链接：https://www.tarot.to/
 * 项目文档：https://docs.tarot.to/
 * GitHub：https://github.com/tarot-finance
 * 已完成功能： supperETH, withdraw
 *
 */

const { getContract } = require("../../../../base/utils");

class UnWrappedETH {
    constructor() {
        this.WETHAddr = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";
        this.WETHAbi = require("./abi/WETH.json");
    }

    async getWETHContract(wallet) {
        return getContract(this.WETHAddr, this.WETHAbi, wallet);
    }


    async withdrawEth(wallet, amount) {
        const WETHContract = await this.getWETHContract(wallet);
        const response = await WETHContract.withdraw(amount);
        return await response.wait();
    }

}

module.exports = UnWrappedETH;
