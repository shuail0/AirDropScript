const { getContract } = require('../../../../base/utils');

/**
 * 项目链接：https://app.reactorfusion.xyz/
 * 项目文档：https://docs.reactorfusion.xyz/
 * 已完成功能： 存取款（ETH、ERC20Token）、借贷、还款
 * 未完成功能： 抵押品开关、 负债金额查询
 */


class ReactorFusion {
    constructor() {
        this.RFAddr = '0x5f7CBcb391d33988DAD74D6Fd683AadDA1123E4D';
        this.oracelAddr = '0x9919f167326AE0f6251dB2fF05F6F70eC6e0c6c2';
        this.Comptroller = '0xF3CaF0bE62a0E6Ff6569004af55F57A0B9440434';
        this.Unitroller = '0x23848c28Af1C3AA7B999fA57e6b6E8599C17F3f2';
        this.rfUSDCAddr = '0x04e9Db37d8EA0760072e1aCE3F2A219988Fdac29';
        this.rfETHAddr = '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6';
        this.rfEthRepayAddr = '0x1d49f21c70adbc243906ffd6cf84c460d23152c2';
        this.RFimplementation = '0x5fED00811e8B84B1CD37B07cE16E7C78cB07e89d';
        this.RewardsDistributorimplementation = '0x7e40162E8b98186F3eEe0104ED4E03bDB6e64B34';
        this.RewardsDistributorproxy = '0x53C0DE201cabob3f74EA7C1D95bD76F76EfD12A9';

        this.rfEthAbi = require('./abi/rfEth.json');
        this.rfEthRepayAbi = require('./abi/rfEthRepay.json')
        this.rfTokenAbi = require('./abi/rfToken.json');
    };
    getrfTokenContract(wallet, rfTokenAddr=this.rfETHAddr, rfTokenAbi=this.rfEthAbi) {
        return getContract(rfTokenAddr, rfTokenAbi, wallet);
    };

    async supplyEth(wallet, amount) {
        const rfEthContract = this.getrfTokenContract(wallet);
        const params = {value: amount};
        const response = await rfEthContract.mint(params);
        return await response.wait();
     };

    async withdrawEth(wallet, amount) {
        const rfEthContract = this.getrfTokenContract(wallet);
        const response = await rfEthContract.redeem(amount);
        return await response.wait();

     }

    async borrowEth(wallet, amount) {
        const rfEthContract = this.getrfTokenContract(wallet);
        const response = await rfEthContract.borrow(amount);
        return await response.wait();
     };

    async repayEth(wallet, amount) {
        const rfEthRepay = getContract(this.rfEthRepayAddr, this.rfEthRepayAbi, wallet);
        const params = {value: amount};
        const response = await rfEthRepay.repayBehalfExplicit(wallet.address, this.rfETHAddr, params);
        return await response.wait();
     };


    async supplyToken(wallet, amount, token=this.rfUSDCAddr) {
        const rfTokenContract = this.getrfTokenContract(wallet, token, this.rfTokenAbi);
        const response = await rfTokenContract.mint(amount);
        return await response.wait();
     };

    async withdrawToken(wallet, amount, token=this.rfUSDCAddr) {
        const rfTokenContract = this.getrfTokenContract(wallet, token, this.rfTokenAbi);
        const response = await rfTokenContract.redeem(amount);
        return await response.wait();

     };

    async borrowToken(wallet, amount, token=this.rfUSDCAddr) {
        const rfTokenContract = this.getrfTokenContract(wallet, token, this.rfTokenAbi);
        const response = await rfTokenContract.borrow(amount);
        return await response.wait();
     };
    
    async repayToken(wallet, amount, token=this.rfUSDCAddr){
        const rfTokenContract = this.getrfTokenContract(wallet, token, this.rfTokenAbi);
        const response = await rfTokenContract.repayBorrow(amount);
        return await response.wait();
     };
     
};

module.exports = ReactorFusion;