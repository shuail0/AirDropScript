

class ModeBridge {
    constructor(wallet) {
        this.wallet = wallet;
        this.bridgeAddress = '0x735aDBbE72226BD52e818E7181953f42E3b0FF21'
    }

    // 发送ETH
    async bridgeETHToMode(value = '0x0') {
        const transaction = {
            from: this.wallet.address,
            to: this.bridgeAddress,
            gasLimit: '130000',
            gasPrice: await this.wallet.provider.getGasPrice(),
            nonce: await this.wallet.getTransactionCount(),
            value: value,
        };
        const response = await this.wallet.sendTransaction(transaction);
        return await response.wait();
    }
}

module.exports = ModeBridge;