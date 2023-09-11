const { BigNumber, Wallet, providers, utils } = require('ethers');
const { getContract, floatToFixed } = require('../../../../base/utils');
const { SequencerProvider, constants, RpcProvider } = require("starknet");

class StkBridges {
    constructor() {
        this.ethContractAddr = '0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419';
        this.stkContractAddr =  '0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82';
        this.stkDepositEntryPointSelector = '0x2d757788a8d8d6f21d1cd40bce38a8222d70654214e96ff95d8086e684fbee5';
        // this.stkProvider = new SequencerProvider({ baseUrl: constants.BaseUrl.SN_MAIN });
        this.stkProvider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/kxngzU4tlSqGotz30twQ9E6n4876XMZz'});

        this.bridgeAbi = require('./abi/deposit.json')
    };

    async getL1ToL2MessageFee(ethAddr=this.ethContractAddr, stkContractAddr=this.stkContractAddr, entryPointSelector=this.stkDepositEntryPointSelector, payload=[]) {
        /**
         * stkAddr： eth调用的智能合约地址
         * stkContractAddr：stk调用的智能合约地址
         * entryPointSelector：程序调用接口（哈希值）
         * payload： 以数组形式传入所调用的接口的参数
         */
        const responseEstimateMessageFee = await this.stkProvider.estimateMessageFee({
            from_address: BigNumber.from(ethAddr).toString(),
            to_address: stkContractAddr,
            entry_point_selector: entryPointSelector,
            payload: payload
        });
        return responseEstimateMessageFee.overall_fee;
    };

    async depositEth (wallet, amount, stkAddr, stkFee) {
        /**
         * wallet: ethers钱包类
         * amount: 跨链币数
         * stkAddr: stk接收钱包地址
         * stkFee: 预估的stk网络Gas费
         */

        const bridge = getContract(this.ethContractAddr, this.bridgeAbi, wallet);
           // 计算预留gas
        const params = {
            value: amount.add(stkFee),
            gasLimit: BigNumber.from(117855),
            gasPrice: await wallet.getGasPrice()

        };
        const response = await bridge.deposit(amount, BigNumber.from(stkAddr).toString(), params);
        return await response.wait();
    };
};


module.exports = StkBridges;

