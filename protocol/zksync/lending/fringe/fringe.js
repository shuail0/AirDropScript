const { Wallet } = require('ethers');
const { getContract } = require('../../../../base/utils');

/**fringe.fi
 * 项目链接：https://appv2.fringe.fi/
 * 项目文档：
 * 已完成功能： 存取款（stable）
 */


class FringeFi {
    constructor() {
        this.usdcAddr = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4';
        this.usdtAddr = '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C';
        this.wETHAddr = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91';
        this.poolAddr = '0x8f1d37769a56340542Fb399Cb1cA49d46Aa9fec8';
        // this.RFAddr = '0x5f7CBcb391d33988DAD74D6Fd683AadDA1123E4D';
        // this.oracelAddr = '0x9919f167326AE0f6251dB2fF05F6F70eC6e0c6c2';
        // this.Comptroller = '0xF3CaF0bE62a0E6Ff6569004af55F57A0B9440434';
        // this.Unitroller = '0x23848c28Af1C3AA7B999fA57e6b6E8599C17F3f2';
        // this.rfUSDCAddr = '0x04e9Db37d8EA0760072e1aCE3F2A219988Fdac29';
        // this.rfETHAddr = '0xC5db68F30D21cBe0C9Eac7BE5eA83468d69297e6';
        // this.rfBTCAddr = '0x0a976E1E7D3052bEb46085AcBE1e0DAccF4A19CF';
        // this.rfUSDTAddr = '0x894cccB9908A0319381c305f947aD0EF44838591';
        // this.rfEthRepayAddr = '0x1d49f21c70adbc243906ffd6cf84c460d23152c2';
        // this.RFimplementation = '0x5fED00811e8B84B1CD37B07cE16E7C78cB07e89d';
        // this.RewardsDistributorimplementation = '0x7e40162E8b98186F3eEe0104ED4E03bDB6e64B34';
        // this.RewardsDistributorproxy = '0x53C0DE201cabob3f74EA7C1D95bD76F76EfD12A9';

       
        this.poolAbi = require('./abi/abi.json');
        
    };


    getpoolContract(wallet, poolAddr=this.poolAddr, poolAbi=this.poolAbi) {
        return getContract(poolAddr, poolAbi, wallet);
    };
    
    
    async deposit(wallet, amount){
        const poolContract = this.getpoolContract(wallet, this.poolAddr, this.poolAbi);

        // const params = {
        //       gasPrice: await wallet.getGasPrice(),
        //       gasLimit: await fTokenContract.estimateGas.mint(amount)//预估eth gas
            
        //     };
        
        //     console.log('params:', params);
            
        const response = await poolContract.deposit(this.usdcAddr, amount);
        return await response.wait();
    };     

    // async withdraw(wallet, amount){
    //     const fTokenContract = this.getfTokenContract(wallet, this.fWethAddr, this.fTokenAbi);
    //     const response = await fTokenContract.withdraw(amount);
    //     return await response.wait();
    // }
     
};

module.exports = FringeFi;