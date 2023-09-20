const ethers = require('ethers');
const winston = require('winston');
const fs = require('fs');
const { BigNumber, utils } = require('ethers');

// 创建合约
const getContract = (address, abi, provider) => {
    return new ethers.Contract(address, abi, provider)
};

// 检查是否是有效的私钥
const isValidPrivateKey = (key) => {
  try {
      new ethers.Wallet(key);
      return true;
  } catch {
      return false;
  }
};


// 将浮点数转换为大数
const floatToFixed = (num, decimals = 18) => {
    return BigNumber.from(utils.parseUnits(num.toString(), decimals));
  };

// 将大数转换为浮点数
const fixedToFloat = (num, decimals = 18) => {
return parseFloat(utils.formatUnits(num, decimals));
};

const toBeHex = (value) => {
  // 如果 value 已经是 BigNumber，直接转换
  // 否则，先将其转化为 BigNumber
  let bigNum = BigNumber.isBigNumber(value) ? value : BigNumber.from(value);
  return bigNum.toHexString();
};

// 将CSV文件转换为Objects
const convertCSVToObjectSync = (filePath) => {
  const objects = [];
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const lines = fileData.trim().split('\n');
  const header = lines[0].split(',');
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      const trimmedKey = header[j].replace(/\s/g, '');
      if (trimmedKey === 'taskTag') {
          obj[trimmedKey] = values[j].trim(); // 移除换行符和其他空白字符
      } else {
          obj[trimmedKey] = values[j];
      }
    }
    objects.push(obj);
  }
  return objects;
};


// 暂停函数
const  sleep = (minutes) => {
    const milliseconds = minutes * 60 * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };

// 在范围内随机获取浮点数
const getRandomFloat = (min, max, precision = 18) => {
  const integerPrecision = 10 ** precision;
  const randomInteger = Math.floor(Math.random() * (max * integerPrecision - min * integerPrecision) + min * integerPrecision);
  return randomInteger / integerPrecision;
};

// 随机生成域名
const generateRandomDomain = (length, mode = "mix") => {
  let charset;

  switch (mode) {
      case "numeric":
          charset = "0123456789";
          break;
      case "alphabetic":
          charset = "abcdefghijklmnopqrstuvwxyz";
          break;
      case "mix":
      default:
          charset = "abcdefghijklmnopqrstuvwxyz0123456789";
          break;
  }

  let domainName = "";
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      domainName += charset[randomIndex];
  }

  return domainName;
};

// bigNumber 乘以浮点数

function multiplyBigNumberWithDecimal(bigNum, decimal, precision = 18) {
  // 将小数转换为一个整数，基于所给的精度（默认是10^18）
  const multiplier = ethers.BigNumber.from("10").pow(precision);
  const scaledDecimal = ethers.BigNumber.from((decimal * Math.pow(10, precision)).toFixed(0));
  
  // 乘以转换后的小数值然后除以精度，得到最终结果
  return bigNum.mul(scaledDecimal).div(multiplier);
};

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}


// 保存日志
const saveLog = (projectName, message) => {
    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: `./${projectName}.log` }),
      ],
    });
    const currentTime = new Date().toISOString();
    logger.info(`${currentTime} ${message}`);
  };

module.exports = { getContract, floatToFixed, fixedToFloat, convertCSVToObjectSync, sleep, getRandomFloat, saveLog, isValidPrivateKey,generateRandomDomain, multiplyBigNumberWithDecimal, getRandomElement, toBeHex }