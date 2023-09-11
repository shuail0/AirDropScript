/**
 * zerc20 Mint程序
 * 1. 钱包进入后， MInt4个币 (后续可以增加地址)
 */

const Zerc20 = require('../protocol/zksync/other/zerc20/zerc20');


module.exports = async (wallet) => { 
    const zerc20 = new Zerc20();
    const erc20Datas = [
        {
            address: '0x932b59178382519335b5d5a38153b2797350b435',
            value: 0.00001
        },
        {
            address: '0x68623581B4e00C82978Ed0aeF803CaAF1E65CA63',
            value: 0.0001
        },
        {
            address: '0xDFB334e9a42Dc5C8d13542a0363bc7EE811aA673',
            value: 0.0001
        },
        {
            address: '0xab6164ed79F2ADfE2d23f3ea4FC5EE5D356fD44A',
            value: 0.0001
        },
        {
            address: '0xaE2B26c27259c43973119Db0E52eCe395B5eA265',
            value: 0.0001
        },
    ];
    const randomIndex = Math.floor(Math.random() * erc20Datas.length);
    try {
        const erc20Data = erc20Datas[randomIndex];
        console.log(erc20Data)

        console.log('开始Mint token，合约地址: ', erc20Data.address);
        const tx = await zerc20.mint(wallet, erc20Data.address, erc20Data.value);
        console.log('mint成功：', tx)
    } catch (error) {
        console.log('mint失败，错误内容：', error); 
    };
};