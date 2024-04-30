
const ethers = require('ethers');
const bs58 = require('bs58');
// const utils = require('ethers/utils');

class EclipseTestNetBridge {
    constructor(wallet) {
        this.name = 'eclipseTestNetBridge';
        this.wallet = wallet
        this.contractAddress = '0x7C9e161ebe55000a3220F972058Fb83273653a6e';
        this.abi = ["function deposit(bytes32,uint256,uint256) payable"];
    }


    async swapAndBridge(solanaAddress, amount, fee) {
        const contract = new ethers.Contract(this.contractAddress, this.abi, this.wallet);
        const bytesSolanaAddress = bs58.decode(solanaAddress);
        const hexSolanaAddress = ethers.utils.hexlify(bytesSolanaAddress);
        const totalamount = amount.add(fee);
        const response = await contract.deposit(hexSolanaAddress, amount, fee, {
            gasPrice: await this.wallet.getGasPrice(),
            gasLimit: 160000,
            value: totalamount
        });
        return await response.wait();
    }


}

module.exports = EclipseTestNetBridge;