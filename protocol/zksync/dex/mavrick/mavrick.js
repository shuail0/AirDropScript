const path = require('path');
const ethers = require('ethers');
const { getContract, floatToFixed } = require('../../../../base/utils');

class Mavrick { 
    constructor(){
        this.routerAddr = '0x39E098A153Ad69834a9Dac32f0FCa92066aD03f4';
        this.factoryAddr = '0x2C1a605f843A2E18b7d7772f0Ce23c236acCF7f5';

        this.routerAbi = require('./abi/MaverickIRouter.json');
        this.factoryAbi = require('./abi/MaverickIFactory.json');
    };

    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async swapEthToToken(wallet, tokenIn, tokenOut, amount, pool, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const callData = [
            router.interface.encodeFunctionData('exactInputSingle', [
                [
                    tokenIn,
                    tokenOut,
                    pool,
                    wallet.address,
                    1e13,
                    amount,
                    min,
                    floatToFixed(0)
                ]
            ])
        ]
        const response = await router.multicall(callData, {value: amount});
        return await response.wait();
     };
    async swapTokenToToken(wallet, tokenIn, tokenOut, amount, pool, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const callData = [
            router.interface.encodeFunctionData('exactInputSingle',[
                [
                    tokenIn,
                    tokenOut,
                    pool,
                    wallet.address,
                    1e13,
                    amount,
                    min,
                    floatToFixed(0)
                ]
            ])
        ];
        const response = await router.multicall(callData);
        return await response.wait();
     };

    async swapTokenToEth(wallet, tokenIn, tokenOut, amount, pool, min=ethers.BigNumber.from(0)) {
        const router = await this.getRouter(wallet);
        const callData = [
            router.interface.encodeFunctionData('exactInputSingle',[
                [
                    tokenIn,
                    tokenOut,
                    pool,
                    '0x0000000000000000000000000000000000000000',
                    1e13,
                    amount,
                    min,
                    floatToFixed(0)
                ]
            ])
        ];
        callData.push(
            router.interface.encodeFunctionData('unwrapWETH9', [
                floatToFixed(0),
                wallet.address
            ])
        );
        const response = await router.multicall(callData);
        return await response.wait();
     };
};

module.exports = Mavrick;