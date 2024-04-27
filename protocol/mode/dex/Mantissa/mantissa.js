
/**
 * 项目名称：Mantissa
 * 项目链接：https://app.mantissa.finance/#/swap
 * 项目文档：
 * GitHub：
 * 已完成功能： swap
 * 
 */

const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class MantissaSwap {
    constructor(wallet) {
        this.wallet = wallet;
        this.poolAddr = '0x4af97f73343b226C5a5872dCd2d1c4944BDb3E77';
        this.poolAbi = require('./abi/Pool.json');
    };

    async getPool() {
        return getContract(this.poolAddr,this.poolAbi, this.wallet);
    };

    async swap(tokenIn, tokenOut, amount, min = ethers.BigNumber.from(0)) {
        const pool = await this.getPool();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        const params = {
            gasPrice
        };
        const response = await pool.swap(
            tokenIn,
            tokenOut,
            this.wallet.address,
            amount,
            min,
            ethers.BigNumber.from(Math.floor(Date.now() / 1000)).add(1800),
            { gasPrice }
        );
        return await response.wait();

    };
};

module.exports = MantissaSwap;