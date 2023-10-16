# AirDropScript

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



后续更新计划：

近期计划主要是为zks全自动大额交互做准备

1. 增加币安提币
2. 增加OK获取冲币地址、资金划转至主账户
3. zks增加新项目、增加mavrick和izuswap单边流动性
4. 优化zks的dex交互路径和逻辑
5. 增加项目(下图）：

![image-20230919205219181](/Users/lishuai/Documents/crypto/bockchainbot/AirDropScript/image-20230919205219181.png)

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





# 运行程序



