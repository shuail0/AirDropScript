
/**
 *  项目名称： ZeroLend
 * 项目链接：https://app.zerolend.xyz/
 * 项目文档：https://docs.zerolend.xyz/
 * GitHub：https://github.com/zerolend
 * 已完成功能： supplyEth, withdrawEth, borrowEth, repayEth, supplyToken, withdrawToken, borrowToken, repayToken
 * 
 */

const { tokenApprove } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class ZeroLend {
    constructor() {
        this.WrappedTokenGatewayV3Addr = '0x767b4A087c11d7581Ac95eaFfc1FeBFA26bad3d2';
        this.PoolProxyzkSync = '0x4d9429246EA989C9CeE203B43F6d1C7D83e3B8F8';
        this.aWETHToken = '0x9002ecb8a06060e3b56669c6B8F18E1c3b119914';

        this.WrappedTokenGatewayV3AddrAbi = require('./abi/WrappedTokenGatewayV3.json');
    };
    getWrappedTokenGatewayV3Contract(wallet) {
        return getContract(this.WrappedTokenGatewayV3Addr, this.WrappedTokenGatewayV3AddrAbi, wallet);
    };
    getUnitrollerContract(wallet) {
        return getContract(this.Unitroller, this.UnitrollerAbi, wallet)
    };

    async enterMarkets(wallet, rfTokenAddress) {

    };
    async exitMarket(wallet, rfTokenAddress) {

    };

    async aTokenApprove(wallet, aTokenAddr, spender, amount){
        return await tokenApprove(wallet, aTokenAddr, spender, amount);
    };

    async supplyEth(wallet, amount) {
        const WrappedTokenGatewayV3 = this.getWrappedTokenGatewayV3Contract(wallet);
        const params = {value: amount};
        const response = await WrappedTokenGatewayV3.depositETH(this.PoolProxyzkSync, wallet.address, 0, params);
        return await response.wait();
     };

    async withdrawEth(wallet, amount) {
        const WrappedTokenGatewayV3 = this.getWrappedTokenGatewayV3Contract(wallet);
        const response = await WrappedTokenGatewayV3.withdrawETH(this.PoolProxyzkSync, amount, wallet.address);
        return await response.wait();

     }

    async borrowEth(wallet, amount) {

     };

    async repayEth(wallet, amount) {

     };


    async supplyToken(wallet, amount, token=this.rfUSDCAddr) {

     };

    async withdrawToken(wallet, amount, token=this.rfUSDCAddr) {


     };

    async borrowToken(wallet, amount, rfToken=this.rfUSDCAddr) {

     };
    
    async repayToken(wallet, amount, rfToken=this.rfUSDCAddr){

     };

    async getBorrowAmount(wallet, rfToken) {

    }
     
};

module.exports = ZeroLend;