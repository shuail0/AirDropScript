
/**
 *  项目名称： IronClad
 * 项目链接：https://app.ironclad.finance
 * 项目文档：https://docs.ironclad.finance
 * GitHub：
 * 已完成功能： deposit, withdraw
 * 
 */

const { coinbase } = require('ccxt');
const { tokenApprove, checkApprove, fetchToken } = require('../../../../base/coin/token');
const { getContract } = require('../../../../base/utils');

class IronClad{
    constructor(wallet) {
        this.wallet = wallet;
        this.lendingPoolAddr = '0xC01a7AD7Fb8a085a3cc16be8eaA10302c78a1783';
        this.proxyContractAddr = '0xB702cE183b4E1Faa574834715E5D4a6378D0eEd3';
        this.ironEzETHAddr = '0x272CfCceFbEFBe1518cd87002A8F9dfd8845A6c4';
        this.ezETHAddr = '0x2416092f143378750bb29b79ed961ab195cceea5';
        // this.unitroller = '0xFB3323E24743Caf4ADD0fDCCFB268565c0685556';
        // this.ionWETHAddr = '0x71ef7eda2be775e5a7aa8afd02c45f059833e9d2';
        // this.ionUSDCAddr = '0x2be717340023c9e14c1bb12cb3ecbcfd3c3fb038';
        // this.ionUSDTAddr = '0x94812f2eea03a49869f95e1b5868c6f3206ee3d3';
        // this.ionWBTCAddr = '0xd70254c3bad29504789714a7c69d60ec1127375c';
        // this.ionezETHAddr = '0x59e710215d45f584f44c0fee83da6d43d762d857';
        // this.ionweETHAddr = '0x9a9072302b775ffbd3db79a7766e75cf82bcac0a';
        // this.ionSTONEAddr = '0x959fa710ccbb22c7ce1e59da82a247e686629310';

        this.lendingPoolAbi = require('./abi/lendingpoolabi.json');
    };
    getproxyContract(proxyContractAddr=this.proxyContractAddr, abi=this.lendingPoolAbi){
        return getContract(proxyContractAddr, abi, this.wallet)
    };

    async deposit(amount){
        const proxyContract = this.getproxyContract();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const response = await proxyContract.deposit(this.ezETHAddr, amount, this.wallet.address, '0x0');
        return await response.wait();
    };

    async withdraw(amount){
        const proxyContract = this.getproxyContract();
        const gasPrice = (await this.wallet.provider.getGasPrice()).mul(50).div(100); // 减少50%的gasPrice
        const response = await proxyContract.withdraw(this.ezETHAddr, amount, this.wallet.address);
        return await response.wait();
    }

    

};

module.exports = IronClad;