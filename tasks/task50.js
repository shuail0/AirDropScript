/**
 *   ArgentX账户升级程序，将账户从cario0升级至cario1.
 */

const tasks = require('.');
const {multExchangeWithdraw} = require('../protocol/cex/multiExchangeWithdraw');
const {sleep, getRandomFloat} = require('../base/utils');
const {Provider, Account, constants, RpcProvider, Contract, num} = require('starknet');

module.exports = async (params) => {
    const { Address: accountAddress, PrivateKey: accountPrivateKey} = params;

    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });
    const newImplementation = "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";
    const oldProxyClass = await provider.getClassAt(accountAddress);
    const proxyArgentX = new Contract(oldProxyClass.abi, accountAddress, provider);
    const res1 = await proxyArgentX.get_implementation();
    const oldImplementationCH=num.toHex(res1.implementation)
    console.log("old class hash implemented =",oldImplementationCH );
    const oldImplementationClass= await provider.getClassByHash(oldImplementationCH);
    const contractArgentX=new Contract(oldImplementationClass.abi,accountAddress,provider);
    const call1 = contractArgentX.populate("upgrade", {
        implementation: newImplementation,
        calldata: [0]
    });
    console.log("calldata =",call1.calldata);

    const accountArgentX=new Account(provider,accountAddress,accountPrivateKey);
    contractArgentX.connect(accountArgentX);
    const { transaction_hash: th1 } = await contractArgentX.upgrade(call1.calldata);
    console.log("th1 =",th1);
    const tr1 = await provider.waitForTransaction(th1);
    console.log("tr1 =",tr1);
    // wait next block, then
    const newCH = await provider.getClassHashAt(accountAddress);
    console.log("new class hash =", newCH);
    const newContract = await provider.getClassAt(accountAddress);
    console.log('✅ Test completed.');
 };
