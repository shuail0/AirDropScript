/**
 *  项目名称： unWrappedETH
 * 项目描述： 通过WETH合约提取ETH
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

    async depositEth(wallet, amount) {
        const WETHContract = await this.getWETHContract(wallet);
        const response = await WETHContract.deposit({ value: amount });
        return await response.wait();
    }

}

module.exports = UnWrappedETH;
