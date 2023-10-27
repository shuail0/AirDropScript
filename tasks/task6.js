/**
 * tasks6 : zksNetwork交互程序：
 *  1.传入wallet类。
 *  2.随机生成域名。
 *  3.注册域名
 */

const ZksNetwork = require('../protocol/zksync/nft/zksnetwork/zksnetwork');
const { generateRandomDomain  } = require('../base/utils.js')
const ethers = require('ethers');

module.exports = async (params) => {
    const { wallet } = params
    const zksNetwork = new ZksNetwork();
    let domainName = generateRandomDomain(7);
    let state = await zksNetwork.isDomainAvailable(wallet, domainName);
    
    // 如果域名不可用，就重新生成并检查，直到找到可用的域名为止
    while (!state) {
        domainName = generateRandomDomain(7);
        state = await zksNetwork.isDomainAvailable(wallet, domainName);
    }
    // 当找到可用的域名时，进行注册
    const tx = await zksNetwork.registerDomain(wallet, domainName);
};

