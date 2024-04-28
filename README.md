# AirDropScript

# 更新记录
## 2024/4/28 更新
- 新增任务：
   - task37: syncswap Paymaster交互任务， 首先将账户中20%-60%的ETH兑换为USDC、DAI、USDT其中一种，然后再换回ETH，换回的金额为获得的币种-0.5。
- 任务调整：
   - task22: 删除任务。
   
## 2024/4/19 更新
- 新增任务：
   - task411: 交易所提ETH至starknet后再将ETH从官桥跨链至主网。程序数据格式参照`stk大额数据模板.csv`, 主网的地址填到`exchangeAddr`字段中即可。运行主程序为`StkLargeVolumeTransaction.js`.
- 其他：
   - 包更新：使用了新版本的starknetjs库，运行前先执行`npm i`,安装新版本的库。

### 2024/4/10 更新
- 新增任务：
   - task510:查询Mode链的钱包是否有wETH，如果有，转换为原生ETH。
- 任务调整：
   - task507:修复兑换ezETH兑换ETH收到wETH的BUG。
   - task508:修复兑换ezETH兑换ETH收到wETH的BUG。


### 2024/4/8 更新

- 新增项目：AperTure、Stone跨链桥、Ironclad、LayerBank、Molend、币安提币和资金划转
- 新增运行程序：runner目录下新增` bnSubtrasfer.js`程序，功能是将指定资产从所有子账户的现货账户中归集到主账户现货账户中，每30秒执行一轮。运行前需要把代码中的` mainAccEmail`改为主账户的邮箱地址，` currenc`改为需要归集的币种。
- 新增任务：
  - task105: Stone刷跨链程序， 从币安提ETH至Manta后兑换为Stone，然后再Manta和Stone之间来回跨链20-30次（每次跨链算一次）。最后再将Stone换回ETH，存入交易所。 使用LayerZero运行程序执行，数据模板参考zksync大额模板。
  - task504: IronClad交互程序,存入ez ETH，等待1-5分钟后取出
  - task505: LayerBank交互程序, 随机存入30% - 50%的ETH，等待1-5分钟后取出
  - task509: Molend交互程序, 随机存入20% - 60%的ETH，等待1-5分钟后取出

## 2024/4/2 更新
- 新增项目： Kim、SwapMode、Supswap、Ionic
- 新增任务：
   - task502: Ionic交互项目，将账户中的所有ezETH存入Ionic中。
   - task506: Kim 交互任务，将30%-60%的ETH兑换为ezETH，随机休息1-5分钟后再换回ETH。
   - task507: SwapMode 交互任务，将30%-60%的ETH兑换为ezETH，随机休息1-5分钟后再换回ETH。
   - task508: Supswap 交互任务，将30%-60%的ETH兑换为ezETH，随机休息1-5分钟后再换回ETH。

## 2024/3/26 更新

- 新增项目: Renzo质押项目
- 基础功能更新：
  - config/RpcConfig.json：增加Mode Network默认RPC。
  - config/tokenAddress.json: 增加Mode网络常用token合约地址。
- 新增任务：
  - task501：renzo交互任务，将账户余额的30%-50%的ETH质押转换为ezETH。

## 2024/3/25 更新
- 新增任务
   - task59: zksync从交易所提币，并将提的币跨链到主网。数据模板使用zksync大额交互模板，用zksync大额交互程序执行。
   - task500: 主网跨链至Mode网络，将账户余额中除保留资金（代码27行，根据需求调整）和预留gas外的所有ETH跨链至Mode网络，用layzero执行程序运行。

## 2024/3/21 更新
- 新增任务：
   - task410: starknet资金归集任务，将账户中的USDC、WBTC、USDT兑换为ETH后归集到交易所地址中。

## 2024/2/28 更新

- 新增项目：zept、zkdx、rubyScore、BigInt、gambit、chainPray、zkswap、zomma、FringeFi、OnsenSwap。

- 对任务列表重新进行调整和排序，调整后的规则如下：

  - task0-99: zksync交互任务
  - task100-199: layzero交互任务
  - task200-299: 签到类任务
  - task300-399: 查询类任务
  - 400-499: starknet交互任务

- 新增任务：

  - task27：zept交互程序,mint zept。

  - task28：mint fUsdt。

  - task29：rubyScore投票。

  - task30：BigInt mint nft

  - task31：gambit交互程序，小额存入USDC。

  - task32：chainPray mint NFT

  - task33:  Zk-Swap交互程序,小额将ETH兑换为USDC

  - task34:  zomma交互程序，小额存入USDC

  - task35: FringeFi交互程序，小额存入USDC

  - task36: OnsenSwap,小额将ETH兑换为USDC

    

## 2024/2/28 更新

- 新增项目：Basilisk、xBank、zkFox、DraculaFi、veSync、pixelSwap。

- 新增任务：
  - task21：Basilisk交互程序, 随机存入30%-50%的ETH，间隔一段时间后取出。
  - task22：xBank交互程序, 随机存入30%-50%的ETH，间隔一段时间后取出。
  - task23：zkFox交互程序, 随机存入30%-50%的ETH，间隔2分钟后取出。
  - task24：DraculaFi交互程序，随机将30%-50%的ETH兑换为USDC，并将获得的USDC兑换为ETH。
  - task25：veSync交互程序，随机将30%-50%的ETH兑换为USDC，并将获得的USDC兑换为ETH。
  - task26：PixelSwap交互程序，随机将20%-30%的ETH换成wETH，再将账户中所有的wETH换成ETH。

## 2024/2/26 更新
- 新增项目： Arbitrum和Optimism网络余额、tx、消耗gas查询，查询任务使用LayerZero任务执行程序`LayerZeroRunner.js`执行。
- 任务调整： 
   - task301: 增加容错，保证所有账户都能被查询。
   - task302: 增加容错，保证所有账户都能被查询。
- 新增任务： 
   - task300: 查询主任务，执行此任务可以运行task301/302/303/304。
   - task303: Arbitrum网络余额和查询指定Token的余额、tx数量、花费的GAS(ETH)任务。
   - task304: Optimism网络余额和查询指定Token的余额、tx数量、花费的GAS(ETH)任务。

## 2024/2/23 更新
- 新增项目： zksync和Ethereum网络余额、tx、消耗gas查询，查询任务使用LayerZero任务执行程序`LayerZeroRunner.js`执行。
- 新增任务：
   - task208: SmartLayer空投查询任务
   - task301: zksync网络余额和查询指定Token的余额、tx数量、花费的GAS(ETH)任务，在代码中的tokens变量设置要查询的token名称（直接增加列表），执行前先检查config/tokenAddres.json文件的zkSync字段有没有要查询的token地址，如果没有需要手动添加。查询结果保存在data目录下的zkSyncBalances.csv文件中。
   - task302: Ethereum网络余额和查询指定Token的余额、tx数量、花费的GAS(ETH)任务，在代码中的tokens变量设置要查询的token名称（直接增加列表），执行前先检查config/tokenAddres.json文件的zkSync字段有没有要查询的token地址，如果没有需要手动添加。网站接口返回的GAS消耗比浏览器查看到的低，这个GAS消耗只能作为参考。查询结果保存在data目录下的zkSyncBalances.csv文件中。 查询时需要打开ClashX的增强模式。
## 2024/2/19 更新
- 新增项目： voyager查询账户交易历史、staraknet领取空投合约
- 新增任务： 
   - task61： starknet 查询指定Token的余额、tx数量、花费的GAS(ETH)任务，在代码中的tokens变量设置要查询的token名称（直接增加列表），执行前先检查config/tokenAddres.json文件的starkNet字段有没有要查询的token地址，如果没有需要手动添加。查询结果保存在data目录下的stkBalances.csv文件中。
   - task62：stk空投数量cha查询，查询完成后将结果保存在data/stkAirdropInfo.csv文件中。
   - task63：stk空投claime程序,需要用tasks62的查询结果执行作为执行账户。

## 2024/1/25 更新
- 基础功能更新：
   - 新增smart layer执行主程序SmartLayerRunner.js（runner目录下）和配置文件SmartLayerConfig.json(config目录下)，SmartLayerRunner执行主程序会循环执行6次任务操作，每轮账户执行完毕后休息20分钟再次执行下一轮操作。
- 新增项目： berachain领水。
- 项目调整：
   - Uniswap： 在swap执行前先预估gas
- 任务调整：
   - task207: 增加猫咪升级检查，如果猫咪可以升级，则会自动执行升级。
- 新增任务：
   - task254: berachain领水任务。
   
## 2024/1/18 更新
- 基础功能更新
   - funcs.js: 新增add10PercentGasPrice函数，用来获取当前gas+10%的函数，方便发送交易时增加gas。
   - requestHelper.js: 新增sendRequest函数，用于发送网络请求，请求默认设置5秒的timeout。
- 配置更新：
   - ChekInRunnerConfig.json ： 更换代理提供商，将代理IP更换为3分钟换一次IP
- 新增项目： smartlayer
- 任务调整：
   - task200: 新增代理检测，如果代理失效暂停3分钟后再重新检测，直至成功. 同时增加任务执行日志功能。
   - task201: 优化代码
   - task202: 优化代码
   - task203: 优化代码
   - task204: 调整执行逻辑，将Carv任务更改为只做roin网络的签到
- 新增任务：
   - task205: Carv opBNB网络签到
   - task206: Carv zkSync网络签到
   - task207: smartlayer 任务执行程序
   - task251: smartlayer获取钱包持有的猫咪，并保存至本地，第一次跑smartlayer需要执行一次，每个钱包只做一次。
   - task252: web3go mintPass 任务， 第一次跑web3GO 需要先mintPass，每个钱包只做一次。
   - task253: robot获取抽奖券任务，第一次跑robot需要执行一次，每个钱包只做一次。


## 2024/1/12 更新
- 基础功能更新：
   - 新增签到运行主程序CheckInRunner.js（runner目录下）和配置文件ChekInRunnerConfig.json(config目录下)。
   - 新增调用合约的基础函数funcs.js (在base目录下)。
- 新增项目：新增web3go、rebot、qna3、carv四个项目。
- 新增任务：增加task200、task201、task202、task203、task204。
   - task200: 签到主要任务，这个任务可以调用其他的签到任务
   - task201: rebot交互任务，包含领取奖励和领取新的奖券，第一次运行只能领取抽奖券，第二天开始可以领取奖励和奖券
   - task202: QnA3 签到程序，每天执行签到。同时程序也支持投票需要时可以投票。后续需要claim奖励，奖励只能在BSC网络claim。
   - task203: web3Go签到， 初次运行需要mint一个pass（程序注释了），后续只需要签到即可
   - task204: Carv签到， 手工Mint完ID就可以签到，每天可以签到一次，每次签到roin、opBNB、zkSync三条链。


## 2024/1/8 更新
- 项目更新： 新增zkBridge、robot项目
- 新增任务： 新增task23、task104
   - task23: robot交互：领取抽奖券
   - task104: zkBridge交互： zkBridge随机跨ETH程序，随机数量为范围内随机。

## 2024/1/2 更新
- 项目更新: 新增basilisk、xbank、woofi、Uniswap、harmonybridge、corebridge。
- 新增任务：增加task20、task21、task22、task36、task37、task38、task102、task10。
   - task20: woofi交互：在指定范围随机将一定数量的ETH兑换为USDC,将获得的USDC兑换为ETH。存取ETH。
   - task21： basilisk交互：存取ETH
   - task22： xBank交互：存取ETH
   - task36： pancake交互：向最近创建的LP仓位存取流动性1次。
   - taks37:  Mavrick交互：向最近创建的LP仓位存取流动性1次。
   - task38： izumi交互：向最近创建的LP仓位存取流动性1次。
   - task102： coreDao跨链：随机向coreDao跨链0.01-0.1USDC，余额不足时从Uniswap买入0.0001ETH的USDC
   - task103： Harmony跨链：随机向Harmony跨链0.01-0.1USDC，余额不足时从Uniswap买入0.0001ETH的USDC

- 任务调整：
   - task30: 增加task36、task37、task38的调用，并且调整随机逻辑。
   - task31： pancake交互：将任务调整为创建LP仓位，并且存取流动性1次。
   - taks32:  Mavrick交互：将任务调整为创建LP仓位，并且存取流动性1次。。
   - task33： izumi交互：将任务调整为创建LP仓位，并且存取流动性1次。。
   - task34： reactor交互：将存取款循环次数调整为1次。
   - task35： zeroLend交互：将存取款循环次数调整为1次。



## 2023/12/26 更新
- 新增任务：
   - task0: zksync 官桥任务，将账户中的ETH除预留gas外全部跨链至zksync中。

## 2023/12/22 更新
- 基础功能更新：
   - 将StkTaskRunnet.js程序的RPC获取方式改为从RpcConfig.json获取

## 2023/12/20 更新

- 基础功能更新： 
   - 新增Layerzero运行主程序： LayerZeroRunner.js (在runner目录下) 和配置文件 LayerZeroRunnerConfig.json（在config目录下）；
   - 新增RPC配置管理文件 RpcConfig.json， 目前已经在layerzero中使用，后续将应用只其它链中; 
   - token地址配置文件 tokenAddress.json， 目前已经在layerzero中使用，后续将应用只其它链中;
   - token.js新增: getErc20Balance方法，用于非zksync网络查询erc20代币余额信息
- 项目更新： 新增Stargate项目
- 新增任务：
   - task100: stargate跨ETH任务，任务将ETH从余额最多的链随机跨链其他链中（保留部分余额作为gas），仅原生Token为ETH的链可用。配置链可以在第18行代码修改。
   - task101: stargate跨USDC任务，任务将USDC余额最多的链随机跨链其他链中，stargat在op、arb、polygon链中的token为USDC.e，存入资金时需要注意币种。配置链可以在第26行代码修改， 预留金额可以在第20行修改.


## 2023/12/18 更新
- 基础功能更新： token.js新增checkApprove函数,用于检查授权和授权erc20token。
- zksync周活任务更新： 将approve逻辑从用多少授权多少，调整为每次交易前查询授权金额，若授权额度小于交易金额，则授权交易金额的10倍额度。

## 2023/12/15 更新
- OKX提币更新： 将提币时遇到余额不足的情况抛出错误调整为余额不足时暂停10分钟后重试

## 2023/12/11 更新
- 项目更新： 增加rhino、spacefi、taort、impermax等项目
- 新增任务：增加task17、task18、19三个任务

## 2023/11/29 更新
- 项目更新： 增加zkSwap、spacefi两个项目
- 新增任务：增加task15、task16两个项目

## 2023/11/29 更新
- 基础工具更新: 将starknet交易的最大gas调整为预估gas+10%， stkToken.js增加getTrasferCallData函数。
- 项目更新: 新增nostra、ekubo两个项目，myswap新增CL增加和移除流动性。
- 新增任务：增加task70、task71、task72、task73、task74四个任务.
   - task70: starknet大额交互执行任务，从交易所中提币-> 执行taks71-74 4个任务 -> 将资金重新存入交易所。
   - task31： myswap单边增加ETH-USDC池流动性程序，每次加入账户ETH-0.02，反复增加2次。
   - task32： ekubo单边增加ETH-USDC池流动性程序，每次加入账户ETH-0.02，反复增加2次。
   - task33： zklend大额交互程序，每次存入账户ETH-0.02ETH，反复存取2次。
   - taks34:  nostra大额交互程序，每次存入账户ETH-0.02ETH，反复存取2次。
- 其他调整： 将引用的starknet包版本从5.24.3换回5.19.5版本。


## 2023/11/28 更新

- 新增zeroLend项目和对应任务 task35.js
- 将task31、task32、task33、task34四个任务的ETH交互金额调整为余额-0.02ETH。
- task30增加task35执行步骤。
  zksync Era大额交互执行: 
   1. zksync大额交互账户配置模板在data目录下的zks大额交互模板中，按照模板进行配置。
   2. 配置task统一配置为30，tasks会依次运行task31、task32、task33、task34、task35。
   3. 交易所API账户配置在config目录下的CexApiKeys.json文件。
   4. 程序运行配置在config目录下的ZksLargeVolumeTrasactionConfig.json文件。
   5. 大额交互运行程序为runner目录下的zksLargeVolumeTransaction.js文件。

## 2023/11/13 更新

- 增加task30、task31、task32、task33、task34四个任务
- task30: 大额交互执行任务，从交易所中提币-> 执行taks31-34 4个任务 -> 将资金重新存入交易所。
- task31： pancake单边增加ETH-USDC池流动性程序，每次加入0.95ETH的流动性，反复增加5次。
- task32： mavrick单边增加ETH-USDC池流动性程序，每次加入0.95ETH的流动性，反复增加5次。
- task33： izumi单边增加ETH-USDC池流动性程序，每次加入0.95ETH的流动性，反复增加5次。
- taks34:  reactor大额交互程序，每次存入0.95ETH，反复存取5次。
- 将csv文件打开方式修改为使用papaparse库打开, 需要使用`npm install` 命令更新库。

## 2023/11/1更新

- 新增tasks10-tasks14五个任务，这五个是velocore、syncswap、mavrick、mute、ezkalibur的交互程序；
- 任务流程：
  1. 将指定范围随机将一定数量的ETH兑换为USDC。
  2. 将获得的USDC兑换为ETH。
- 数量默认为0.001-0.002ETH，想要修改范围可以打开对应的`tasks.js`文件，修改代码中的`minAmount`和`maxAmoung`变量。
- 原来的task1-5是将钱包中一定比例的ETH兑换为USDC，再将钱包中的所有USDC兑换为ETH。新增的任务是在一定范围内将ETH兑换为USDC，并将收到的USDC在兑换为ETH，根据实际情况跑不同的task就可以。。



# intro

### 支持项目： 

- zksync：
  - 跨链：官方跨链桥
  - DEX：ezkalibur、mavrick、mute、syncswap、velocore、
  - 借贷：rectorfusion、
  - 其它：zerc20、overnight、zksnetwork
- starknet：
  - 跨链：官方跨链桥
  - DEX:  jediswap、10kswap、myswap、sithswap、starkex
  - 借贷：zklend
- 交易所：
  - 提币: okx

### 功能

整体功能：

1. 支持随机账户、随机交互项目、随机金额
2. 项目之间可以任意组合，编排任务，形成交互链路
3. 增加cex提币，提币->跨链->交互一条龙；

跨链：

1. zks跨链桥已经做了，后续可以移植过来，提币跨链一步到位。
2. stk跨链桥现在已经支持从OK提币走官方桥到stk（刚走了200个号，非常丝滑）

DEX交互： 

	1. 所有的DEX都支持自动化交易，并且支持随机交易账户一定比例的余额（目前zks固定20%-30%）。
	1. stark目前所有DEX支持一定程度的随机(ETH->随机一个币->ETH)，zks目前支持ETH->USDC->ETH 后续优化后支持和stk同样的方式（有动手能力的可以自己先改）。
	1. zks的jediswap和10kswap支持增加流动性（但还没有增加到任务里，后续可以增加），zksync后续将支持mavrick和izuswap的单边流动性（接下来会先做）。
	1. 程序支持跨DEX交互，后续可以增加一个任务在多个DEX之间交互的任务（有想法可以跟我说，性感小李在线写代码）。

借贷：

1. zks的rectorfusion项目可以存取款
2. stk的zklend支持存取款、借款和还款。

其它项目：

1. zksnetwork可以随机mint域名；
2. zerc20目前是随机mint几个价格比较低的项目其中一个，每次都是随机；
3. overnight可以mint和销毁。


# 程序结构

``` 
AirDropScript
.
├── README.md 
├── base  # 基础工具目录
├── config  # 配置目录，所有配置文件在这里设置
├── data  # 数据文件（这里可以查看账户模板）
├── logs  # 日志目录，运行后会有成功和失败的目录，方便查看
├── protocol  # 协议目录，所有协议的接口都在这个目录下面
├── tasks  # 任务目录，具体项目执行逻辑都在这里配置
└── runner  # 运行文件目录，运行目录下的文件可以跑对应功能的程序
```



# 帐号准备

程序从指定的.csv文件中读取帐号数据和任务配置，不链和不同的任务类型的帐号格式有所区别，运行前需要按照下面的格式准备好帐号。

## zkSync任务账户文件

| Wallet     | Address | PrivateKey | taskTag |
| ---------- | ------- | ---------- | ------- |
| testwallet | 0x0000  | xxxxxxxxxx | 1       |

**字段解释**：

	- Wallet： 钱包备注，可以自由填写方便识别。
	- Address：钱包地址(公钥)。
	- PrivateKey：钱包私钥。
	- taskTag:  任务标签，程序根据此标签执行对应的任务。

## StarkNet账户准备

| Wallet     | Address  | PrivateKey | Cairo | taskTag |
| ---------- | -------- | ---------- | ----- | ------- |
| testwallet | 0x000000 | 0x000000   | 0     | 58      |

StarkNet目前用的是人字拖钱包，暂不支持头盔钱包。

**字段解释**：

 - Wallet： 钱包备注，可以自由填写方便识别。
 - Address：钱包地址(公钥)。
 - PrivateKey：钱包私钥。
 - Cairo: 钱包的Cairo版本，近期（23年9月）升级过的钱包填1，没升级的填0.
 - taskTag:  任务标签，程序根据此标签执行对应的任务。

## StarkNet 从交易所提币 + 跨链账户准备

| Wallet     | Address | PrivateKey | taskTag | tag  | currency | amount | chain     | exchange_name | starknetAddr |
| ---------- | ------- | ---------- | ------- | ---- | -------- | ------ | --------- | ------------- | ------------ |
| testwallet | xxxx    | xxxxx      | 13      |      | ETH      | 0.02   | ETH-ERC20 | okx           | 0x06666      |

**字段解释**：

 - Wallet： 钱包备注，可以自由填写方便识别（EVM钱包)。
 - Address：钱包地址(公钥)。
 - PrivateKey：钱包私钥。
 - taskTag:  任务标签，程序根据此标签执行对应的任务(提币、跨链也是一个任务)。
 - tag: 交易所提某些币（如EOS）时钱包需要的memo种类的参数，没有则留空。
 - currency：要提的币种。
 - chain：提币的链。
 - exchange_name：交易所名字。
 - starknetAddr：starknet钱包地址。



# 连接Github下载代码

## GIT安装配置

**1. 检查是否已安装 Git：**

首先，打开终端应用程序（Terminal），并运行以下命令来检查是否已安装 Git：

``` bash
git --version
```

如果 Git 已经安装，将显示 Git 的版本号。如果没有安装，你将看到一个提示，询问是否要安装 Git。按照提示完成安装。

**2. 配置用户信息：**

在终端中运行以下命令，设置你的 Git 用户名和邮箱地址。这些信息将用于你的 Git 提交记录。

``` bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"

```

请将 `"Your Name"` 和 `"youremail@example.com"` 替换为你的Github姓名和Github邮箱地址。

**3. 生成 SSH 密钥：**

为了与 GitHub 进行安全的通信，你需要生成 SSH 密钥。运行以下命令生成 SSH 密钥：

``` bash
ssh-keygen -t ed25519 -C "youremail@example.com"
```

在这里，将 `"youremail@example.com"` 替换为你的 GitHub 邮箱地址。按照提示，可以选择在默认位置保存密钥，或者指定自己的位置。不设置密码时，将无需输入密码即可访问密钥。

**4. 添加 SSH 密钥到 SSH 代理：**

在终端中运行以下命令，以确保 SSH 密钥已经添加到 SSH 代理，以便不再需要输入密码。

``` bash
eval "$(ssh-agent -s)"
ssh-add -K ~/.ssh/id_ed25519
```

请确保 `~/.ssh/id_ed25519` 路径正确，如果你将密钥保存到了不同的位置，请相应更改。

**5. 添加 SSH 密钥到 GitHub：**

将你的公共 SSH 密钥添加到 GitHub。运行以下命令来复制你的公钥:

``` bash
pbcopy < ~/.ssh/id_ed25519.pub
```

然后，访问 GitHub 的设置页面，在 "SSH and GPG keys" 部分添加一个新的 SSH 密钥，将复制的公钥粘贴到那里。

**6. 验证连接：**

最后，在终端运行以下命令来验证你的 SSH 密钥是否成功连接到 GitHub：

``` bash
ssh -T git@github.com
```

如果一切设置正确，你将看到一条消息，确认你已成功连接到 GitHub。



## 代码下载和更新

1. 打开终端（在 macOS 上是终端应用，或在 Windows 上是命令提示符或 PowerShell）。

2. 使用 `cd` 命令导航到你希望将代码克隆到的本地目录。例如：

   ``` bash
   cd /path/to/your/local/directory
   ```

   在这里，将 `/path/to/your/local/directory` 替换为你要放置代码的实际本地目录路径。

3. 运行 `git clone git@github.com:shuail0/AirDropScript.git` 命令下载代码。
4. 后续在程序目录下运行 `git pull`可以获得更新。



# 环境安装

## 安装Nodejs

### 1. 在Mac上安装

#### 安装nvm:

1. 打开一个终端。

2. 使用Homebrew (如果已经安装) 来安装nvm：`brew install nvm`

   如果没有安装Homebrew, 你可以使用以下命令来安装nvm：

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
   ```

3. 在你的`~/.bash_profile`、`~/.zshrc`、`~/.profile` 或 `~/.bashrc` 中添加以下行 (如果使用的是bash或zsh):  

   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
   ```

4.  重新启动你的终端或者运行 `source ~/.bash_profile` (或你修改的对应文件)。

#### 安装Node.js:

1. 在终端中使用`nvm`来安装Node.js (程序使用的是18.16.0)：

   ``` bash
   nvm install 18.16.0
   ```



### 2.在Windows上安装

#### 安装nvm：

1. 访问 [nvm-windows GitHub repository](https://github.com/coreybutler/nvm-windows) 并从"Releases"部分下载最新的`nvm-setup.zip`文件。
2. 解压缩并运行安装程序。

#### 安装Node.js:

1. 打开一个命令提示符或PowerShell窗口。

2. 使用`nvm`来安装Node.js (程序使用的是18.16.0)：

   ``` bash
   nvm install 18.16.0
   ```



## 安装依赖

在终端中用`npm`安装依赖：` npm install zksync-web3 starknet winston qs ccxt`



# 参数配置

所有参数配置均在coinfig文件目录下：

​	`CexApiKeys.json` ： 交易所API配置，将从交易所创建的ApiKey填入对应字段即可。

​	`StkTaskRunnerConfig.json`:  Starknet运行配置，具体参数设置如下：

```json
    "ethrpc": "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl",  // 以太坊主网RPC设置，可以从alchemy申请
    "maxGasPrice": 20,  // 最大GAS限制，运行时GAS大于这个值，程序暂停
    "walletPath": "/Users/lishuai/Documents/crypto/bockchainbot/StkTestWalletData.csv",  // 地址文件路径
    "CONCURRENCY": 1,  // 运行线程数量
    "minInterval": 0.5,  // 账号间隔最小时间
    "maxInterval": 15  // 账号间隔最大时间
```

`ZksTaskRunnerConfig.json`: zkSync运行配置，具体参数设置如下：

```json
{
    "zskrpc": "https://mainnet.era.zksync.io", // zkSync网络RPC设置，可以从alchemy申请
    "ethrpc": "https://eth-mainnet.g.alchemy.com/v2/qRnk4QbaEmXJEs5DMnhitC0dSow-qATl",// 以太坊主网RPC设置，可以从alchemy申请
    "maxGasPrice": 20,    // 最大GAS限制，运行时GAS大于这个值，程序暂停
    "walletPath": "/Users/lishuai/Documents/crypto/bockchainbot/TestWalletData.csv", // 地址文件路径
    "CONCURRENCY": 2,  // 运行线程数量
    "minInterval": 0.5,  // 账号间隔最小时间
    "maxInterval": 15  // 账号间隔最大时间
}
```



# 运行程序

1. 在终端进入runner 目录` cd runner`runner目录下有多个文件，根据需要执行的任务来运行对应文件即可,如想要执行zksync的任务，在终端运行`node ZksTaskRunner.js`即可：
   - `stkbridge.js`: 从主网跨链至STK网络
   - `StkTaskRunner.js`：执行Starknet网络的任务
   - `StkwithdrwAndbridge.js`： 执行从交易所提币，并走官方桥跨链至STK网络
   - `ZksTaskRunner.js`： 执行zkSync网络的任务

