/**
 * 项目名: nostra
 * 项目地址：https://nostra.finance/
 * 项目文档：https://docs.nostra.finance/start-here/what-is-nostra
 */

const { getApproveCallData, getBalance } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, feltToInt, floatToUint256, strToFelt, bigNumbetToUint256 } = require('../../../../base/stkUtils.js')

const { CallData } = require('starknet');


class Starki {
    constructor() {

        this.inscribeAbi = require('./abi/starki.json')

    };


    getInscribeContract(account, inscribeAddr) {
        return getContract(inscribeAddr, this.inscribeAbi, account);
    };

    getInscribeCallData(account, inscribeAddr, inscribeData) {
        // 取出所有存款
        const inscribeContract = this.getInscribeContract(account, inscribeAddr);
        const callData = inscribeContract.populate(
            'inscribe',
            {
                'user_data': [JSON.parse(inscribeData)]
            }
        );
        return callData
    };



    async inscribe(account, inscribeAddr) {
        const inscribeCallData = {
            contractAddress: inscribeAddr,
            entrypoint: 'inscribe',
            calldata: [
                "61",
                "100",
                "97",
                "116",
                "97",
                "58",
                "44",
                "123",
                "34",
                "112",
                "34",
                "58",
                "34",
                "115",
                "116",
                "97",
                "114",
                "107",
                "45",
                "50",
                "48",
                "34",
                "44",
                "34",
                "111",
                "112",
                "34",
                "58",
                "34",
                "109",
                "105",
                "110",
                "116",
                "34",
                "44",
                "34",
                "116",
                "105",
                "99",
                "107",
                "34",
                "58",
                "34",
                "83",
                "84",
                "82",
                "75",
                "34",
                "44",
                "34",
                "97",
                "109",
                "116",
                "34",
                "58",
                "34",
                "49",
                "48",
                "48",
                "48",
                "34",
                "125"
              ]
        }
        console.log(inscribeCallData)
        const multiCallData = [inscribeCallData];
        return await multiCallContract(account, multiCallData);
    };


};

module.exports = Starki;