const { BigNumber, Wallet, providers, utils } = require('ethers');
const { getContract, floatToFixed } = require('../../../../base/utils');
const { SequencerProvider, constants, RpcProvider, CallData } = require("starknet");
const { multExchangeWithdraw } = require('../../../cex/multiExchangeWithdraw');
const { getContract:getStkContract, bigNumbetToUint256, multiCallContract } = require('../../../../base/stkUtils');
const { gettokenTransferCallData } = require('../../../../base/coin/stkToken');
class StkBridges {
    constructor() {
        this.ethContractAddr = '0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419';
        this.stkContractAddr =  '0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82';
        this.stkDepositEntryPointSelector = '0x2d757788a8d8d6f21d1cd40bce38a8222d70654214e96ff95d8086e684fbee5';
        // this.stkProvider = new SequencerProvider({ baseUrl: constants.BaseUrl.SN_MAIN });
        this.stkProvider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/kxngzU4tlSqGotz30twQ9E6n4876XMZz'});

        this.bridgeAbi = require('./abi/deposit.json');
        this.stkETHBridgeAbi = require('./abi/stkETHBridgeAbi.json');
    };

    getStkBridgeContract(account) {
        return getStkContract(this.stkContractAddr, this.stkETHBridgeAbi, account);
    }

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

    async getL2ToL1MessageFee(account, callData) {
        const  { suggestedMaxFee: estimatedFee1 } = await account.estimateInvokeFee(callData);
        return estimatedFee1;
    }

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

    getWithdrawCallData (account, recipient, token, amount) {
        const bridgeContract = this.getStkBridgeContract(account);
        console.log('amount:', amount);
        return bridgeContract.populate(
            "initiate_token_withdraw",
            {
                l1_token: '0x' + Buffer.from(token.symbol, 'utf8').toString('hex'),
                l1_recipient: recipient,
                "amount": amount
            }
        )

    }

    async withdrawETH ( account, token, amount, recipient) {
        let bridgeAmount, callData;
        // const tokenBalance = await account.getBalance(token.address);
        bridgeAmount = amount - 100000000000000n;
        if (bridgeAmount <= 0n) {
            console.log('提币金额过小');
        }
        callData = this.getWithdrawCallData(account, recipient, token, bridgeAmount);
        const fee = await this.getL2ToL1MessageFee(account, callData);
        console.log('Bridge fee:', fee);
        const trasferCallData = gettokenTransferCallData(token.address, '0x6e02b62e101b44382d030d7aee5528bf65eed13d3b2d5da3dfa883a2e1ce5f7', fee);
        bridgeAmount = amount - fee;
        callData = this.getWithdrawCallData(account, recipient, token, bridgeAmount);
        // const multiCallData = [trasferCallData, callData];
        const multiCallData = [callData];
        console.log('multiCallData:', multiCallData);
        return await multiCallContract(account, multiCallData);

    }
};


module.exports = StkBridges;

