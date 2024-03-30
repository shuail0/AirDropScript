const path = require('path');
const ethers = require('ethers');
const { convertCSVToObjectSync, getContract, floatToFixed } = require('../../../../base/utils');
const { tokenApprove } = require('../../../../base/coin/token');

class Sturdy {
    constructor(wallet) {
        this.wallet = wallet;
        this.vaultAddress = '0x735aDBbE72226BD52e818E7181953f42E3b0FF21';
        this.sturdyPairAddress = '0xb93B53CA8a51A78348a9B22718ca7fe77D13B900';
        this.vaultAbi = require('./abi/vault.json');
    }
    

    getVaultContract() {
        return getContract(this.vaultAddress, this.vaultAbi, this.wallet);
    }

    async depositETH(amount) {

        const vaultContract = this.getVaultContract();
        const tx = await vaultContract.deposit(amount, this.wallet.address,{ value: amount });
        return await tx.wait();
    }

    async withdrawETH(amount) {
        const vaultContract = this.getVaultContract();
        const tx = await vaultContract.withdraw(amount, this.wallet.address, this.wallet.address, 10);
        return await tx.wait();
    }
}