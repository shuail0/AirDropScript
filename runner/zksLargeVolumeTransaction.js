const { Wallet, Provider } = require("zksync-web3");
const {
  convertCSVToObjectSync,
  fixedToFloat,
  sleep,
  appendObjectToCSV,
  saveLog,
  getRandomFloat,
  decryptUsingAESGCM,
  monitorGasPrices
} = require("../base/utils");
const tasks = require("../tasks");
const ethers = require("ethers");
const CONFIG = require("../config/ZksLargeVolumeTrasactionConfig.json");
const readlineSync = require("readline-sync");
const fs = require("fs");
const crypto = require("crypto");

const provider = new Provider(CONFIG.zskrpc);
const ethereumProvider = new ethers.getDefaultProvider(CONFIG.ethrpc);
const walletData = convertCSVToObjectSync(CONFIG.walletPath);
const pwd = readlineSync.question("Please enter your password: ", {
  hideEchoBack: true, // 密码不回显
});

const logWithTime = async (filepath, message) => {
  const currentTime = new Date().toISOString();
  const fullMessage = `time:${currentTime}, ${message}`;
  console.log(fullMessage);
  saveLog(filepath, fullMessage);
};

async function checkGasPrice() {
  while (true) {
    console.log("开始获取当前主网GAS");
    try {
      const gasPrice = fixedToFloat(await ethereumProvider.getGasPrice(), 9);

      if (gasPrice <= CONFIG.maxGasPrice) {
        console.log(
          `当前的gas为：${gasPrice}，小于${CONFIG.maxGasPrice}，程序继续运行`
        );
        return gasPrice;
      }

      console.log(
        `当前的gas为：${gasPrice}，大于${CONFIG.maxGasPrice}，程序暂停10分钟`
      );
      await sleep(10); // 10 minutes
    } catch (error) {
      console.log("获取GAS价格失败，程序暂停1分钟后重新尝试");
      await sleep(1); // 1 minute
    }
  }
}

// 执行函数
const executeTask = async (taskTag, params) => {
  // 转换taskTag为字符串形式
  const taskName = "task" + taskTag;
  // 检查任务是否存在
  if (typeof tasks[taskName] === "function") {
    console.log("地址：", params.Address, " 开始执行任务：", taskName);
    await tasks[taskName](params);
  } else {
    console.log(`Task ${taskName} not found!`);
  }
};

(async () => {
  console.log("开始循环...");
  for (wt of walletData) {
    await checkGasPrice(); // 固定最大gas

    const pky = decryptUsingAESGCM(wt.a, wt.e, wt.i, wt.s, pwd);
    wt.wallet = new Wallet(pky, provider, ethereumProvider);

    try {
      await executeTask(wt.taskTag, wt); // 根据taskTag执行对应的任务。
      await logWithTime(
        "../logs/Sucess",
        `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}`
      );
      wt.time = new Date().toISOString();
      delete wt.wallet;
      await appendObjectToCSV(wt, "../logs/zksyncLargeVolumeSucess.csv");
      const interval = getRandomFloat(CONFIG.minInterval, CONFIG.maxInterval);
      console.log(`任务完成，线程暂停${interval}分钟`);
      await sleep(interval);
      console.log("暂停结束");
    } catch (error) {
      await logWithTime(
        "../logs/Error",
        `walletName:${wt.Wallet}, walletAddr:${wt.Address}, taskTag:${wt.taskTag}, error:${error}`
      );
      wt.time = new Date().toISOString();
      wt.error = error;
      delete wt.wallet;
      await appendObjectToCSV(wt, "../logs/zksyncLargeVolumeFail.csv");
    }
  }
})();
