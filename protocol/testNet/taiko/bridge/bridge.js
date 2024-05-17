


const ethers = require('ethers');
const { getContract } = require('../../../../base/utils');
const { id } = require('ethers/lib/utils');


class taikoBridge {
    constructor() {
        this.name = 'taikoBridge';
        this.routerAddr = '0xA098b76a3Dd499D3F6D58D8AcCaFC8efBFd06807';
        this.routerAbi = require('./abi/bridge.json');
    }

    async getRouter(wallet, routerAddr=this.routerAddr, routerAbi=this.routerAbi) {
        return getContract(routerAddr, routerAbi, wallet);
    };

    async sendMessage (wallet, amount) {
        const router = await this.getRouter(wallet);
        const address = wallet.address;
        // const gasprice = ethers.utils.parseUnits('15', 'gwei');
        const gasprice = await wallet.provider.getGasPrice();
        const gasLimit = ethers.utils.hexlify(110000);
        const fee = ethers.utils.parseEther('0.0032');
        const amountFee = amount.add(fee)
        
        const reponse = await router.sendMessage(
            {
            id: 0,
            fee: fee,
            gasLimit: 800017,
            from: address,
            srcChainId: 17000,
            srcOwner: address,
            destChainId: 167009,
            destOwner: address,
            to: address,
            value: amount,
            data: []
        }, {
            gasPrice: gasprice,
            gasLimit: gasLimit,
            value : amountFee
        }
        )
        return await reponse.wait();
    }

}

module.exports = taikoBridge;