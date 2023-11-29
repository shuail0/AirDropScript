/**
 * 项目名: nostra
 * 项目地址：https://nostra.finance/
 * 项目文档：https://docs.nostra.finance/start-here/what-is-nostra
 */

const { getApproveCallData, getBalance } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, feltToInt, floatToUint256, strToFelt, bigNumbetToUint256 } = require('../../../../base/stkUtils.js')

const { CallData } = require('starknet');


class Nostra {
    constructor() {
        this.cdpManager = '0x073f6addc9339de9822cab4dac8c9431779c09077f02ba7bc36904ea342dd9eb';
        this.oracle = '0x07b05e8dc9c770b72befcf09599132093cf9e57becb2d1b3e89514e1f9bdf0ab';
        this.WrapperPriceOracle = '0x07b05e8dc9c770b72befcf09599132093cf9e57becb2d1b3e89514e1f9bdf0ab';
        this.interestRateModel = '0x059a943ca214c10234b9a3b61c558ac20c005127d183b86a99a8f3c60a08b4ff';
        this.deferredBatchCallAdapter = '0x073f6addc9339de9822cab4dac8c9431779c09077f02ba7bc36904ea342dd9eb';

        this.iETH = '0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8';

        this.iTokenAbi = require('./abi/iToken.json')



    };


    getiTokenContract(account, iTokenAddress) {
        return getContract(iTokenAddress, this.iTokenAbi, account);
    };


    getDepositCallData(account, iTokenAddress, amount) {
        // // 获取存款参数
        const params = {
            contractAddress: iTokenAddress,
            entrypoint: 'mint',
            calldata: CallData.compile({
                to: account.address,
                amount: bigNumbetToUint256(amount)
            })
        };
        return params
    };


    getWithdrawAllCallData(account, iTokenAddress, amount) {
        // 取出所有存款
        const iToken = this.getiTokenContract(account, iTokenAddress);
        const callData = iToken.populate(
            'burn',
            {
                burnFrom: account.address,
                to: account.address,
                amount: bigNumbetToUint256(amount)
            }
        );
        return callData
    };

    getWithdrawCallData(token, amount) {
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'withdraw',
            calldata: CallData.compile({
                token: token,
                amount: amount
            })
        };
        return params
    }


    async deposit(account, tokenAddress, iTokenAddr, amount) {

        const approveCallData = getApproveCallData(tokenAddress, iTokenAddr, amount);
        const depositCallData = this.getDepositCallData(account, iTokenAddr, amount);
        const multiCallData = [approveCallData, depositCallData];
        return await multiCallContract(account, multiCallData);
    };

    async withdrawAll(account, iTokenAddr) {
        const iTokenBalance = await getBalance(account, iTokenAddr);
        const withdrawAllCallData = this.getWithdrawAllCallData(account, iTokenAddr, iTokenBalance);
        const multiCallData = [withdrawAllCallData];
        return await multiCallContract(account, multiCallData);
    };


};

module.exports = Nostra;