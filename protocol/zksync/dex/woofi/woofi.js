
const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');

class Woofi {
    constructor() {
        this.routerAddr = '0xfd505702b37Ae9b626952Eb2DD736d9045876417'
        this.WooPPAddr = '0x42ED123EB5266A5B8E2B54B2C76180CCF5e72FEe'
        this.SuperChargerVaultAddr = '0x1d686250BBffA9Fe120B591F5992DD7fC0FD99a4'
        this.routerAbi = require('./abi/WooRouterV2.json');
        this.SuperChargerVaultAddrAbi = require('./abi/WooSuperChargerVault.json');
     }
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async getSuperChargerVaultAddr(wallet, SuperChargerVaultAddr=this.SuperChargerVaultAddr, SuperChargerVaultAddrAbi=this.SuperChargerVaultAddrAbi) {
        return getContract(SuperChargerVaultAddr, SuperChargerVaultAddrAbi, wallet);
    }


    async swapEthToToken(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);


        const params = {
            value:amount
        };
        const response = await router.swap(
            tokenIn,
            tokenOut,
            amount,
            min,
            wallet.address,
            wallet.address,
            params
        );
        return await response.wait();

    }

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0)) { 
        const router = await this.getRouter(wallet);

        const params = {
            value:amount
        };
        const response = await router.swap(
            tokenIn,
            tokenOut,
            amount,
            min,
            wallet.address,
            wallet.address,
            params
        );
        return await response.wait();

    }

    async deposit(wallet, amount) {
        const SuperChargerVaultAddr = await this.getSuperChargerVaultAddr(wallet);

        const params = {
            value:amount
        };

        const response = await SuperChargerVaultAddr.deposit(
            amount,
            params
        );
        return await response.wait();
    }

    async withdraw(wallet) {
        const SuperChargerVaultAddr = await this.getSuperChargerVaultAddr(wallet);
        const response = await SuperChargerVaultAddr.instantWithdrawAll( );
        return await response.wait();
    }

}

module.exports = Woofi;