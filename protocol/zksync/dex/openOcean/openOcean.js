const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');
const { sleep, getRandomFloat, floatToFixed, nearestUsableTick } = require('../../../../base/utils.js');
const { getBalance, tokenTrasfer, fetchToken, tokenApprove } = require('../../../../base/coin/token.js');

class OpenOcean {
    constructor() {
        this.name = 'openOcean';
        this.routerAddr = '0x36A1aCbbCAfca2468b85011DDD16E7Cb4d673230';
        this.proxyAddr = '0xb8a9d621139A367644297dCb0A76844161AEd6df';
        this.routerAbi = require('./abi/routerAbi.json');
    }
    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    }

    async swap(wallet, tokenIn, tokenOut, amount, min=ethers.BigNumber.from(0), maxAmountOut=ethers.BigNumber.from(0)){
        const router = await this.getRouter(wallet);
        const caller = this.proxyAddr;
        const srcReceiver = this.proxyAddr;
        const destReceiver = wallet.address;
        const referrer = "0x3487Ef9f9B36547e43268B8f0E2349a226c70b53";
        const permit = "0x"
        const flags = false;

        const desc = [
            tokenIn, 
            tokenOut,
            srcReceiver,
            destReceiver,
            amount,
            min,
            maxAmountOut,
            flags,
            referrer,
            permit
        ];

        const calls = [
            '0x0', 
            '0x0',
            '0x0',
            []
        ];

        console.log('caller:', caller);
        console.log('swap:', desc);
        console.log('calls:', calls);

        const response = await router.swap(
            caller,
            desc,
            calls
        );

        return await response.wait();
    }

}

module.exports = OpenOcean;


