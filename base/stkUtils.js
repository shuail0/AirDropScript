const starknet = require('starknet')

// 创建合约
const getContract = (address, abi, provider) => {
    return new starknet.Contract(abi, address, provider);
};

const strToFelt = (str) => {
    // 将文本转换为Felt类型的数据。
    return starknet.cairo.felt(str)
};
const strToHex = (str) => {
    // 将字符串转换为16进制字符串
    return starknet.shortString.encodeShortString(str)
};

const feltToStr = (felt) => {
    // 将Felt类型的数据转换为String类型.
    return starknet.shortString.decodeShortString(felt);
 };

const floatToUint256 = (number, decimals=18) => {
    // 将浮点数转换为Uint256
    const numberString = Number(number).toFixed(decimals).replace(".", "");
    return starknet.cairo.uint256(numberString);
 }; 

 const uint256ToBigInt = (number) => {
    return starknet.uint256.uint256ToBN(number);
 };

const feltToInt = (felt) => {
    // 将Felt类型的数据转换为十进制的数值
    return parseInt(starknet.num.getDecimalString(starknet.num.toHex(felt)))
 };

 function multiplyBigIntByFraction(bigintValue, fraction) {
    // bignumberInt 乘以小数的函数
    // 校验输入
    if (fraction >= 1 || fraction <= 0) {
      throw new Error("Fraction should be between 0 and 1");
    }
    // 将小数转换为整数形式，例如 0.98 变为 9800
    const scaleFactor = BigInt(10000);
    const fractionBigInt = BigInt(Math.round(fraction * 10000));
  
    // 计算结果并缩放回去
    const result = (bigintValue * fractionBigInt) / scaleFactor;
  
    return result;
  }

function addSecondsToCurrentTimestamp(secondsToAdd) {
const currentTimeStampInSeconds = Math.floor(Date.now() / 1000);
return currentTimeStampInSeconds + secondsToAdd;
}

const multiCallContract = async (account, multiCallData) => {
    const multiCall = await account.execute(multiCallData);
     const tx = await account.waitForTransaction(multiCall.transaction_hash);
     return tx.transaction_hash;
};


module.exports = {getContract, strToFelt, strToHex, feltToStr, feltToInt, floatToUint256, multiCallContract, uint256ToBigInt, multiplyBigIntByFraction, addSecondsToCurrentTimestamp};
