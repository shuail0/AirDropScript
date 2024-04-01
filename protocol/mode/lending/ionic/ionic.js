
/**
 *  项目名称： Ionic
 * 项目链接：https://app.ionic.money/
 * 项目文档：https://doc.ionic.money/ionic-documentation
 * GitHub：https://github.com/orgs/ionicprotocol/repositories
 * 已完成功能： supplyToken, withdrawToken
 * 
 */

const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class Ionic {
    constructor(wallet) {
        this.wallet = wallet;
        this.unitroller = '0xFB3323E24743Caf4ADD0fDCCFB268565c0685556';
        this.ionWETHAddr = '0x71ef7eda2be775e5a7aa8afd02c45f059833e9d2';
        this.ionUSDCAddr = '0x2be717340023c9e14c1bb12cb3ecbcfd3c3fb038';
        this.ionUSDTAddr = '0x94812f2eea03a49869f95e1b5868c6f3206ee3d3';
        this.ionWBTCAddr = '0xd70254c3bad29504789714a7c69d60ec1127375c';
        this.ionezETHAddr = '0x59e710215d45f584f44c0fee83da6d43d762d857';
        this.ionweETHAddr = '0x9a9072302b775ffbd3db79a7766e75cf82bcac0a';
        this.ionSTONEAddr = '0x959fa710ccbb22c7ce1e59da82a247e686629310';

        this.ionTokenAbi = require('./abi/ionToken.json');
    };
    getWrappedTokenGatewayV3Contract() {
        return getContract(this.WrappedTokenGatewayV3Addr, this.WrappedTokenGatewayV3AddrAbi, wallet);
    };
    getionTokenContract(ionToken) {
        return getContract(ionToken, this.ionTokenAbi, this.wallet)
    };

    async enterMarkets(wallet, rfTokenAddress) {

    };
    async exitMarket(wallet, rfTokenAddress) {

    };

    async aTokenApprove(wallet, aTokenAddr, spender, amount) {
        return await tokenApprove(wallet, aTokenAddr, spender, amount);
    };

    async supplyToken(tokenAddress, amount) {
        // 检查授权
        const tokenInfo = await fetchToken(tokenAddress, this.wallet);
        const ionTokenAddr = this[`ion${tokenInfo.symbol}Addr`];
        const ionTokenContract = this.getionTokenContract(ionTokenAddr);
        await checkApprove(this.wallet, tokenAddress, ionTokenAddr, amount);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        // 存入资产
        const response = await ionTokenContract.mint(amount, { gasPrice });
        return await response.wait();
    };

    async withdrawToken(tokenAddress, amount) {

        // 检查授权
        const tokenInfo = await fetchToken(tokenAddress, this.wallet);
        const ionTokenAddr = this[`ion${tokenInfo.symbol}Addr`];
        const ionTokenContract = this.getionTokenContract(ionTokenAddr);
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(15).div(100); // 减少85%的gasPrice
        // 存入资产
        const response = await ionTokenContract.redeemUnderlying(amount, { gasPrice });
        return await response.wait();
    };

    // async borrowToken(ionToken, amount) {

    //  };

    // async repayToken(ionToken, amount){

    //  };

    // async getBorrowAmount(wallet, rfToken) {

    // }

};

module.exports = Ionic;