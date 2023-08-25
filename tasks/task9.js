/**
 * zerc20 Mint程序
 * 1. 钱包进入后， MInt4个币 (后续可以增加地址)
 */

const Zerc20 = require('../protocol/zksync/other/zerc20/zerc20');


module.exports = async (wallet) => { 
    const zerc20 = new Zerc20();
    const erc20Addrs = ['0x932b59178382519335b5d5a38153b2797350b435', '0x68623581B4e00C82978Ed0aeF803CaAF1E65CA63', '0xDFB334e9a42Dc5C8d13542a0363bc7EE811aA673', '0xab6164ed79F2ADfE2d23f3ea4FC5EE5D356fD44A', '0xaE2B26c27259c43973119Db0E52eCe395B5eA265'];
    
    for (let erc20Addr of erc20Addrs) {
        try {
            console.log('开始Mint token，合约地址: ', erc20Addr);
            const tx = await zerc20.mint(wallet, erc20Addr);
        } catch (error) {
            console.log('mint失败，错误内容：', error); 
        };
    };
};