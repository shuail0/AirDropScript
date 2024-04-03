
const { add } = require('winston');
const { getContract } = require('../../../../base/utils');

class Molend {
    constructor(wallet) {
        this.wallet = wallet;
        this.molendAddress = '0xcbDD8E29304020Cd29e9FDd3F8834b7212368283';
        this.poolAddress = '0x04c3f4c9b12b1041b2fd2e481452e7c861fe1ff8';
        this.molendAbi = require('./abi/molend.json');
    }

    getMolendContract() {
        return getContract(this.molendAddress, this.molendAbi, this.wallet);
    }

    async depositETH(wallet,amount) {
        const molend = this.getMolendContract();
        const address = wallet.address;
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const tx = await molend.depositETH(
            this.poolAddress,
            address,
            '0',
            {
                value: amount,
                gasPrice: gasPrice
            }
        );
        return await tx.wait();
    }

    async depositERC20(wallet,tokenAddress,amount) {
        const molend = this.getMolendContract();
        const address = wallet.address;
        const asset = tokenAddress;
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const tx = await molend.depositERC20(
            this.poolAddress,
            asset,
            address,
            '0',
            {
                value: amount,
                gasPrice: gasPrice
            }
        );
        return await tx.wait();
    }

    async withdrawETH(wallet,amount) {
        const molend = this.getMolendContract();
        const address = wallet.address;
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const tx = await molend.withdrawETH(
            this.poolAddress,
            amount,
            address,
            {
                gasPrice: gasPrice
            }
        );
        return await tx.wait();
    }

    async withdrawERC20(wallet,tokenAddress,amount) {
        const molend = this.getMolendContract();
        const address = wallet.address;
        const asset = tokenAddress;
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const tx = await molend.withdrawERC20(
            this.poolAddress,
            asset,
            address,
            {
                value: amount,
                gasPrice: gasPrice
            }
        );
        return await tx.wait();
    }
}

module.exports = Molend
