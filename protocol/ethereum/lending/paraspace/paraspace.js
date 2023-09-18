/**
 * ParaSpace：Ethereum链的NFT借贷项目
 * 项目链接：https://para.space/
 * 项目文档：https://docs.para.space/para-space/
 * 已完成功能：存取款(ETH、ERC20Token)
 */

const path = require('path');
const ethers = require('ethers');
const { tokenApprove } = require('../../../../base/coin/token');
const { getContract,floatToFixed } = require('../../../../base/utils');

class ParaSpace {
    constructor(){
        this.DAI = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
        this.WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
        this.USDC = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
        this.USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
        this.FRAX = '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F';
        this.WBTC = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
        this.wstETH = '0x5979d7b546e38e414f7e9822514be443a4800529';
        this.ARB = '0x912ce59144191c1204e64559fe8253a0e49e6548';
        this.GMX = '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a';
        this.LINK = '0xf97f4df75117a78c1a5a0dbb814af92458539fb4';
        this.UNI = '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0';
        this.BAL = '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8';
        this.AAVE = '0xba5ddd1f9d7f570dc94a51479a000e3bce967196';
        this.RDNT = '0x3082cc23568ea640225c2467653db90e9250aaa0';
        this.UniswapV3 = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';
        this.UniswapV3Factory = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
        this.UniswapV3SwapRouter = '0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5';
        this.PoolAddressesProviderRegistry = '0x6C05190538B5D28b6866Eff6Fc9533976Cf0Da7c';
        this.PoolAddressesProvider = '0x45a35124749B061a29f91cc8ddf85606586dcf24';
        this.ACLManager = '0xb996F940fd39550998D32b6f56D5bcE56025254f';
        this.SupplyLogic = '0xC0fe2dbe75B8908073B14BF19Af71B1B181f8984';
        this.BorrowLogic = '0x2Cdd46Ea306771DF11CDfc8be8daBC4fe4C42000';
        this.AuctionLogic = '0xCE05EFdC79cE8Fb6D0Ed5A4a223b45ab6a51754e';
        this.LiquidationLogic = '0x9e3FF2c3C7B72493B37321D447e6BBE932Af054D';
        this.FlashClaimLogic = '0x70a226448d9095F4c0ca6Fbe55bBd4da0C75a0A5';
        this.MarketplaceLogic = '0x90c3B619a9714394d45f7CA4D0509A58C991ad02';
        this.PoolLogic = '0x083219a3B839EfC719943159CC64bed83531d9C8';
        this.TimeLockProxy = '0x9F55EaBD8496380BecfB9465d69ADD22eA6Aa7a2';
        this.PoolCoreImpl = '0xE8932402560a13d9519649103d091c009e21778b';
        this.PoolParametersImpl = '0x96809F7Dc560b9873535a9d0Af3247d13D2C2ed4';
        this.PoolMarketplaceImpl = '0x6B58baa08a91f0F08900f43692a9796045454A17';
        this.ParaProxyInterfacesImpl = '0x301F40974160C11b0D96090A7db6c2CB3B295912';
        this.PoolProxy = '0x9E96e796493f630500B1769ff6232b407c8435A3';
        this.ConfiguratorLogic = '0xe8bcFDd8E9d22653a2dA7FE881A12E56aF8983C7';
        this.PoolConfiguratorImpl = '0x1a5191C39D354e52cB60ef060707568931233184';
        this.PoolConfiguratorProxy = '0x5c24B4BaF9e8EC3aBa07Ccb7A5A35B2D0CEc0776';
        this.ReservesSetupHelper = '0x8CE5F6F4268A756b6656F576d0F9Cf4fD73CBb52';
        this.PriceOracle = '0x0000000000000000000000000000000000000000';
        this.NFTFloorOracle = '0x9897B4f327dBD854b84FB0AB020500cB72F983d0';
        this.AggregatorDAI = '0xc5c8e77b397e531b8ec06bfb0048328b30e9ecfb';
        this.AggregatorWETH = '0x639fe6ab55c921f74e7fac1ee960c0b6293ba612';
        this.AggregatorUSDC = '0x50834f3163758fcc1df9973b6e91f0f0f0434ad3';
        this.AggregatorUSDT = '0x3f3f5df88dc9f13eac63df89ec16ef6e7e25dde7';
        this.AggregatorFRAX = '0x0809e3d38d1b4214958faf06d8b1b1a2b73f2ab8';
        this.AggregatorWBTC = '0xd0c7101eacbb49f3decccc166d238410d6d46d57';
        this.AggregatorWstETH = '0x230E0321Cf38F09e247e50Afc7801EA2351fe56F';
        this.AggregatorARB = '0x912CE59144191C1204E64559FE8253a0e49E6548';
        this.AggregatorGMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
        this.AggregatorLINK = '0x86e53cf1b870786351da77a57575e79cb55812cb';
        this.AggregatorUNI = '0x9c917083fdb403ab5adbec26ee294f6ecada2720';
        this.AggregatorBAL = '0xbe5ea816870d11239c543f84b71439511d70b94f';
        this.AggregatorAAVE = '0xad1d5344aade45f43e596773bcc4c423eabdd034';
        this.AggregatorRDNT = '0x20d0fcab0ecfd078b036b6caf1fac69a6453b352';
        this.AggregatorUniswapV3 = '0xBc5ee94c86d9be81E99Cffd18050194E51B8B435';
        this.ParaSpaceOracle = '0x075bC485a618873e7Fb356849Df30C0c1eDca2Bc';
        this.ProtocolDataProvider = '0x9E6D2F4d1731Fe143f89342489Aa4f795B5E8a3f';
        this.UiPoolDataProvider = '0x94bDD135ccC48fF0440D750300A4e4Ba9B216B3A';
        this.WalletBalanceProvider = '0x92D6C316CdE81f6a179A60Ee4a3ea8A76D40508A';
        this.rateStrategyDAI = '0x81f32435e16525f59b83c8Bd4A07C3F7678FeF6A';
        this.timeLockStrategyDAI = '0xa2a9dD7079f05d17BE291D99048e671129DdDc83';
        this.rateStrategyUSDC = '0xEE88Ecf61C43E17deD17b5f0ca2a1B9A55cCf0e0';
        this.timeLockStrategyUSDC = '0xFc59798B42e7270D944a3DdAa4b847ac7f1D19c6';
        this.rateStrategyUSDT = '0x2ead3220A08027E3b547d6597E2A7f49C4827053';
        this.timeLockStrategyUSDT = '0x8D3d95C7Aa3551EaA1b410a4De509c54DfD86fa9';
        this.rateStrategyFRAX = '0xe5db2791fc60F58bc3537263c17a8Daa549999D6';
        this.timeLockStrategyFRAX = '0x5E06F3F86be5dFC398C1F5Cd84e21b46a487120f';
        this.rateStrategyWETH = '0x25d23157bc940259E449835c4BDB902c151DA05f';
        this.timeLockStrategyWETH = '0x7Dc8AA2d49137455BC6f2C63d1455a47f5c1F69e';
        this.rateStrategyXETH = '0xbFB9308F90F23c3B66952aa1176Fc579D3D7351F';
        this.timeLockStrategyWSTETH = '0x2253f97Bfb40D7bEA6fA47aAD30bd61023591d9b';
        this.rateStrategyWBTC = '0xe5B6Ce2CA06b41d904c1f84b006bA21A3ACfCa8e';
        this.timeLockStrategyWBTC = '0x0af83CFf81b9C2ed6B9baCFd33628e726cf95D48';
        this.rateStrategyBAL = '0xB60223B5Cd900e3AE3832f938B2775488625D41D';
        this.timeLockStrategyBAL = '0x83232A90b4e3Eb7e7e7Ad1FbbC432A560B5b2963';
        this.rateStrategyLINK = '0x422b4193a0Dc51120fcCb0e496162FB60199b92b';
        this.timeLockStrategyLINK = '0x08b552922b18F8bCbdC69Bd902A2071a31C39197';
        this.rateStrategyAAVE = '0x9c68B78e1e7B702B263B16a5aD8b27204Ba11628';
        this.timeLockStrategyAAVE = '0x6652d718E4E1DB8B2935cD36f5Af5E05E777E159';
        this.rateStrategyUNI = '0xeE4B8C0bfE4E08C5eCc14a1fc8Aa7B7fc9b80AD7';
        this.timeLockStrategyUNI = '0x22522cfbe287e07e78FE1a5d61E8D4419Fb68a6d';
        this.rateStrategyRDNT = '0x96037421F6ACee61a24FB72D39F37f3befb30fe4';
        this.timeLockStrategyRDNT = '0xCc8806f2B9db7aCecC1482E666e61a2742d4de33';
        this.rateStrategyGMX = '0x867a84Bf9A0AC87c7ce6a697B613Dd53EE045a35';
        this.timeLockStrategyGMX = '0x5E87FD63c63eCB27B0B0919596DE4A9256EF103F';
        this.rateStrategyARB = '0xc9c0EA41E41CD4108577Be0Ede83bbB5ccB3697a';
        this.timeLockStrategyARB = '0x2998655208F6d72c68b3fBD0Adb7Fe0AEb27E1F9';
        this.rateStrategyNFT = '0xa3ad44a4f567F0568ce5ceb76fBb2B4bBb8A22a6';
        this.timeLockStrategyUniswapV3 = '0x45857A415fB9506929178067fa0D7d8276dAF414';
        this.PTokenImpl = '0x82629De4E995Ecf47dB8131090Be2C367cf14BC3';
        this.VariableDebtTokenImpl = '0x7196C13F76AcB6f621E996EF78aEA471657E66fF';
        this.MintableERC721Logic = '0x4738D8fA94d3b35d9c1a2Ca98E97c16e0EA1ef82';
        this.NTokenUniswapV3Impl = '0xd5bADE56595cc8354a19ecA364434E9baCaF54A1';
        this.UiIncentiveDataProvider = '0x6edbe4F52BEFF53C84dF3293b40AebAC8049E2B2';
        this.WETHGatewayImpl = '0xCCEaDe52890f49C212B0f993d8a1096eD57Cf747';
        this.WETHGatewayProxy = '0xF1AeAcD5a332AbF1222eF6649f1d2E60db99Fd87';
        this.ConduitController = '0x5C2e1E5F0F614C4C3443E98680130191de80dC93';
        this.PausableZoneController = '0xfEafE00D51eEe129313158Ef53A046a9831d55ab';
        this.Seaport = '0x1B85e8E7a75Bc68e28823Ce7CCD3fAdEA551040c';
        this.SeaportAdapter = '0xaE40779759Cc4Bf261f12C179A80df728c8d0c75';
        this.ConduitKey = '0x2f2d07d60ea7330DD2314f4413CCbB2dC25276EF000000000000000000000000';
        this.Conduit = '0x7A558886Fee0DeF217405C18cb19Eda213C72019';
        this.PausableZone = '0x3EBf80B51A4f1560Ebc64937A326a809Eb86A5B4';
        this.AirdropFlashClaimReceiver = '0x21013605Ef3C70e0D159Fec5F325acAcF027ec3d';
        this.FlashClaimRegistry = '0x31fdC5D3c5297769341BDc42beF7166B8B624eA0';
        this.UserFlashClaimRegistryProxy = '0x8cC106802bFB6adbdE6CA1CCff2EEae35442313a';
        this.TimeLockImpl = '0x3F736F58F3c51a7C92d8b6996B77Df19a0b5394F';
        // this.nUNI-V3-POS = '0xe0966fE9f52Bf43c5Ae6C9940270d7b016b63866';

        this.wETHGatewayImplAbi = require('./abi/WETHGateway.json');
        this.PoolCoreAbi = require('./abi/PoolCore.json');
        this.PoolProxyAbi = require('./abi/PoolProxy.json');


        this.uint256Max = BigInt(2) ** BigInt(256) - BigInt(1);
     };

     getwETHGatewayContract(wallet, wETHGatewayImplAddr=this.WETHGatewayImpl, wETHGatewayImplAbi=this.wETHGatewayImplAbi) {
        return getContract(wETHGatewayImplAddr, wETHGatewayImplAbi, wallet);
     };
     getPoolCoreContract(wallet, poolCoreAddr=this.PoolCoreImpl, poolCoreAbi=this.PoolCoreAbi) {
        return getContract(poolCoreAddr, poolCoreAbi, wallet);
     };
     getPoolProxyContract(wallet, poolProxyAddr=this.PoolProxy, poolProxyAbi=this.PoolCoreAbi) {
        return getContract(poolProxyAddr, poolProxyAbi, wallet);
     };

    async supplyEth (wallet, amount) {
        // 将ETH存入借贷池，合约会1:1返回pETH Token
        const wETHGateway = this.getwETHGatewayContract(wallet, this.WETHGatewayProxy);
        const params = {value: amount};
        const response = await wETHGateway.depositETH(wallet.address, floatToFixed(0), params);
        return await response.wait();
    };
    async withdrawEth (wallet, amount=this.uint256Max) {
        // 销毁pETH， 取回ETH
        const poolcore = this.getPoolProxyContract(wallet);
        // await tokenApprove(wallet, this.WETH, this.PoolProxy, amount);
        // poolcore.ADDRESSES_PROVIDER().then(console.log);

        // const params = {
        //     gasPrice: await wallet.getGasPrice(),
        //     gasLimit: await poolcore.estimateGas.withdraw(this.WETH,amount, wallet.address),
        //   };
        // console.log(params)
        const response = await poolcore.withdraw(this.WETH,amount, wallet.address);
        return await response.wait();
    };

    async supplyToken (wallet, token, amount) {};
    async withdrawnToken (wallet, token, amount) {};

}
module.exports = ParaSpace;