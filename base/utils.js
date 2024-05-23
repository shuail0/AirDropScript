const ethers = require('ethers');
const winston = require('winston');
const fs = require('fs');
const { BigNumber, utils } = require('ethers');
const crypto = require('crypto');
const Papa = require('papaparse');

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
  const fileData = fs.readFileSync(filePath, 'utf-8');
  const parsedData = Papa.parse(fileData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(), // 移除头部字段周围的空格
      complete: (results) => results.data
  });

  return parsedData.data;
};


//  将objet保存为csv
const saveObjectToCSV = (data, outputPath) => {
  // Check if the file already exists. If not, write headers.
  if (!fs.existsSync(outputPath)) {
      const headers = Object.keys(data[0]).join(',');
      fs.writeFileSync(outputPath, headers + '\n', 'utf8');
  }

  for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const values = Object.values(item).map(value => `"${value}"`).join(',');
      const csvRow = `${values}\n`;

      fs.appendFileSync(outputPath, csvRow, 'utf8');
  }

  console.log(`Data saved to ${outputPath}`);
};

// // 将单个对象追加到 CSV 文件
// const appendObjectToCSV = async (obj, outputPath) => {
//   // Check if the file already exists. If not, write headers.
//   if (!fs.existsSync(outputPath)) {
//       const headers = Object.keys(obj).filter(key => key !== 'wallet').join(',');
//       fs.writeFileSync(outputPath, headers + '\n', 'utf8');
//   }
//   const values = Object.values(obj).map(value => `"${value}"`).join(',');
//   const csvRow = `${values}\n`;
//   fs.appendFileSync(outputPath, csvRow, 'utf8');

// };

const appendObjectToCSV = async (obj, outputPath) => {
  try {
      // Check if the file already exists. If not, write headers.
      if (!fs.existsSync(outputPath)) {
          const headers = Object.keys(obj).join(',');
          fs.writeFileSync(outputPath, headers + '\n', 'utf8');
      }

      const values = Object.values(obj).map(value => `"${value}"`).join(',');
      const csvRow = `${values}\n`;
      fs.appendFileSync(outputPath, csvRow, 'utf8');

      console.log(`Successfully appended data to ${outputPath}`);
  } catch (error) {
      console.error(`Error appending data to CSV: ${error.message}`);
  }
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


const nearestUsableTick = (tick, tickSpacing) => {
  const remainder = tick % tickSpacing;
  if (remainder === 0) {
      // 如果tick已经是tickSpacing的倍数，直接返回
      return tick;
  }
  // 计算与当前tick距离更近的两个可用tick
  const lowerBound = tick - remainder;
  const upperBound = tick + (tickSpacing - remainder);
  // 确定哪一个更近
  if (Math.abs(lowerBound - tick) <= Math.abs(upperBound - tick)) {
      return lowerBound;
  } else {
      return upperBound;
  }
}


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


function getKeyFromPassword(password, salt) {
  const iterations = 100000;
  const keylen = 32;
  const digest = 'sha512';
  return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
}

function decryptUsingAESGCM(a, e, i, s, password) {
  const key = getKeyFromPassword(password, Buffer.from(s, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(i, 'hex'));

  decipher.setAuthTag(Buffer.from(a, 'hex'));

  const decryptedData = Buffer.concat([decipher.update(Buffer.from(e, 'hex')), decipher.final()]);
  return decryptedData.toString('utf8');
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

    // 将字符串转换为64个字符的十六进制数据
  function formHexData(string) {
    // 确保数据是一个字符串
    if (typeof string !== 'string') {
        throw new Error('Input must be a string.');
    }
    // 如果字符前面有0x，去掉它
    if (string.startsWith('0x')) {
        string = string.slice(2);
    }

    // 如果字符串长度超过 64 个字符，则抛出错误
    if (string.length > 64) {
        throw new Error('String length exceeds 64 characters.');
    }

    // 在字符串前面添加零以达到 64 个字符的长度
    return '0'.repeat(64 - string.length) + string;
}


  function readCSVAndCalculateAverageGas(csvFilePath, numBlocks) {
    if (fs.existsSync(csvFilePath)) {
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        const parsed = Papa.parse(fileContent, { 
            header: true,
            transformHeader: header => header.trim() // 在这里修剪每个头部字段
        });
        const data = parsed.data;

        if (data.length < numBlocks + 1) {
            console.log('Not enough data to calculate average.');
            return null;
        }

        const lastRows = data.slice(-numBlocks - 1, -1); // 忽略最后一行，可能为空
        let totalGasPrice = 0;
        let validRowCount = 0;

        for (const row of lastRows) {
            if (row['Base Fee (Gwei)'] && !isNaN(parseFloat(row['Base Fee (Gwei)']))) {
                const gasPrice = parseFloat(row['Base Fee (Gwei)']);
                totalGasPrice += gasPrice;
                validRowCount++;
            } else {
                console.log(`Invalid or missing gas price in row: ${JSON.stringify(row)}`);
            }
        }

        if (validRowCount === 0) {
            console.log('No valid gas price data found.');
            return null;
        }

        const averageGasPrice = totalGasPrice / validRowCount;
        const lastRow = data[data.length - 2]; // 倒数第二行
        const lastGasPrice = parseFloat(lastRow['Base Fee (Gwei)']);

        if (isNaN(lastGasPrice)) {
            console.log('Invalid gas price in the last row.');
            return null;
        }

        return {
            lastGasPrice: lastGasPrice,
            averageGasPrice: averageGasPrice
        };
    } else {
        console.log('CSV file not found.');
        return null;
    }
}

async function monitorGasPrices(csvFilePath, numBlocks, sleepInterval) {
  while (true) {
      console.log("Checking gas prices...");
      const gasData = readCSVAndCalculateAverageGas(csvFilePath, numBlocks);

      if (gasData) {
          console.log(`Current Gas Price: ${gasData.lastGasPrice} Gwei, Average: ${gasData.averageGasPrice} Gwei`);
          if (gasData.lastGasPrice < gasData.averageGasPrice) {
              console.log(`Gas price is below average. Exiting loop.`);
              break;
          } else {
              console.log(`Gas price is not below average. Waiting for ${sleepInterval} minute.`);
          }
      } else {
          console.log(`Unable to calculate gas prices. Retrying in ${sleepInterval} minute...`);
      }

      await sleep(0.1);
  }
}


module.exports = { getContract, floatToFixed, fixedToFloat, convertCSVToObjectSync, sleep, getRandomFloat, saveLog, isValidPrivateKey,generateRandomDomain, multiplyBigNumberWithDecimal, getRandomElement, toBeHex, nearestUsableTick, saveObjectToCSV, appendObjectToCSV, decryptUsingAESGCM, monitorGasPrices, formHexData }