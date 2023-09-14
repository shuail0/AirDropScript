/**
 * 项目名: zkLend
 * 项目地址：https://zklend.com/
 * 项目文档：https://zklend.gitbook.io/documentation/about/portal
 */

const { getApproveCallData,getBalance } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, feltToInt, floatToUint256, strToFelt, bigNumbetToUint256 } = require('../../../../base/stkUtils.js')

const { CallData } = require('starknet');


class ZkLend {
    constructor() {
        this.zkLendMarketAddr = '0x04c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05';
        this.zUSDC = '0x047ad51726d891f972e74e4ad858a261b43869f7126ce7436ee0b2529a98f486';
        this.zUSDT = '0x00811d8da5dc8a2206ea7fd0b28627c2d77280a515126e62baa4d78e22714c4a';
        this.zDAI = '0x062fa7afe1ca2992f8d8015385a279f49fad36299754fb1e9866f4f052289376';
        this.zwBTC = '0x02b9ea3acdb23da566cee8e8beae3125a1458e720dea68c4a9a7a2d8eb5bbb4a';
        this.zETH = '0x01b5bd713e72fdc5d63ffd83762f81297f6175a5e0a4771cdadbc1dd5fe72cb1';
        this.zkLendMarketAbi = require('./abi/zkLendMarket.json');
    };

    getDepositCallData(token, amount) {
        // // 获取存款参数
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'deposit',
            calldata: CallData.compile({
                token: token,
                amount: amount.toString()
            })
        };
        return params
    };

    getEnableCollateralCallData(token) {
        // 将资产作为抵押品
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'enable_collateral',
            calldata: CallData.compile({
                token: token
            })
        };
        return params
    };

    getWithdrawAllCallData(token) {
        // 取出所有存款
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'withdraw_all',
            calldata: CallData.compile({
                token: token
            })
        };
        return params
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

    getBrrowCallData(token, amount) {
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'borrow',
            calldata: CallData.compile({
                token: token,
                amount: amount
            })
        };
        return params
    };
    getRepayAllCallData(token) {
        // 取出所有存款
        // 要先approve
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'repay_all',
            calldata: CallData.compile({
                token: token
            })
        };
        return params
    };
    getRepayCallData(token, amount) {
        // 取出所有存款
        // 要先approve
        const params = {
            contractAddress: this.zkLendMarketAddr,
            entrypoint: 'repay',
            calldata: CallData.compile({
                token: token,
                amount: amount
            })
        };
        return params
    };

    async getIsCollateralEnabled(account, token){
        /**
         * 查询资产是否已经开启抵押
         */
        const zkLendMarket = this.getzkLendMarketContract(account);
        const state = await zkLendMarket.is_collateral_enabled(account.address, token);
        return state.enabled;
    };

    async deposit(account, token, amount) {
        const approveCallData = getApproveCallData(token, this.zkLendMarketAddr, amount);
        const depositCallData = this.getDepositCallData(token, amount);
        const multiCallData = [approveCallData, depositCallData];
        // 查询是否开启抵押品
        const enabledState = await this.getIsCollateralEnabled(account, token);
        if (enabledState === 0n) {  // 如果未开启，则开启
            const enableCollateral = this.getEnableCollateralCallData(token);
            multiCallData.push(enableCollateral)
        }
        return await multiCallContract(account, multiCallData);
    };

    async withdraw(account, token, amount) {
        const withdrawCallData = this.getWithdrawCallData(token, amount);
        const multiCallData = [withdrawCallData];
        return await multiCallContract(account, multiCallData);
    };
    async withdrawAll(account, token) {
        const withdrawAllCallData = this.getWithdrawAllCallData(token);
        const multiCallData = [withdrawAllCallData];
        return await multiCallContract(account, multiCallData);
    };
    async enableCollateral(account, token) {
        const enableCollateralCallData = this.getEnableCollateralCallData(token);
        const multiCallData = [enableCollateralCallData];
        return await multiCallContract(account, multiCallData);
    };
    async borrow(account, token, amount) {
        const borrowCallData = this.getBrrowCallData(token, amount);
        const multiCallData = [borrowCallData];
        return await multiCallContract(account, multiCallData);
    };
    async repay(account, token, amount) {
        const repayCallData = this.getRepayCallData(token, amount);
        const multiCallData = [repayCallData];
        return await multiCallContract(account, multiCallData);
    };
    async repayAll(account, token) {
        const debt = await this.getUserDebtForToken(account, token);  // 这里是查询负债
        const approveCallData = getApproveCallData(token, this.zkLendMarketAddr, debt);
        const repayAllCallData = this.getRepayAllCallData(token);
        const multiCallData = [approveCallData, repayAllCallData];
        return await multiCallContract(account, multiCallData);
    };

    getzkLendMarketContract(account, zkLendMarketAddr=this.zkLendMarketAddr, zkLendMarketAbi=this.zkLendMarketAbi) {
        return getContract(zkLendMarketAddr, zkLendMarketAbi, account);
    };

    async getUserDebtForToken(account, token) {
        // 查询负债
        const zklendContract = this.getzkLendMarketContract(account);
        const debt = await zklendContract.get_user_debt_for_token(account.address, token);
        return floatToUint256(feltToInt(debt.debt));
    };

    async getReserveData(account, token){
        const zklendContract = this.getzkLendMarketContract(account);
        return await zklendContract.get_reserve_data(token)
    };

    async getUserLendingAccumulator(account, token){
        const zklendContract = this.getzkLendMarketContract(account);
        return await zklendContract.get_reserve_data(token)
    };

    async getUserDepositData(account, tokenSymbol) {
        // 获取存款金额，比如
        const zTokenBalance = await getBalance(account, this[`z${tokenSymbol}`]);
        return zTokenBalance;
    };

};

module.exports = ZkLend;