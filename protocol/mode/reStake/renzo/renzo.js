
/**
 * 项目名称：Renzo
 * 项目链接：https://www.renzoprotocol.com/
 * 项目文档：https://docs.renzoprotocol.com/docs
 * GitHub：https://github.com/Renzo-Protocol
 * 已完成功能： depositETH
 * 
 */

const { getContract } = require('../../../../base/utils');

class Renzo {
    constructor(wallet) {
        this.wallet = wallet;
        this.xRenzoDepositAddress = '0x4D7572040B84b41a6AA2efE4A93eFFF182388F88';
        this.xRenzoDepositAbi = require('./abi/xRenzoDeposit.json');
    }


    getxRenzoDeposiContract() {
        return getContract(this.xRenzoDepositAddress, this.xRenzoDepositAbi, this.wallet);
    }

    async depositETH(amount) {
        const xRenzo = this.getxRenzoDeposiContract();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const tx = await xRenzo.depositETH(
            amount.mul(90).div(100),  // 设置10%的滑点
            Math.floor(Date.now() / 1000) + 60 * 20, // deadline
            { value: amount, gasPrice: gasPrice}
        );
        return await tx.wait();
    }
}

module.exports = Renzo