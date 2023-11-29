/**
 * 项目名: ekubo
 * 项目地址：https://ekubo.org/
 * 项目文档：https://docs.ekubo.org/about-ekubo/introduction
 * 已经完成接口： 增加流动性、移除流动性
 */
const { uint256 } = require('starknet');
const { getApproveCallData, tokenTransfer, gettokenTransferCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');
const { warn, log } = require('winston');
const BigNumber = require('bignumber.js');
const axios = require('axios');



function toUint128(number) {
    const uint128Max = new BigNumber(2).pow(128).minus(1);
    const bnNumber = new BigNumber(number).absoluteValue(); // 取绝对值并转换为 BigNumber

    if (bnNumber.isGreaterThan(uint128Max)) {
        throw new Error('Number is out of uint128 range');
    }

    return bnNumber.toString(10);
}

class Ekubo {

    constructor() {
        this.coreAddress = '0x00000005dd3D2F4429AF886cD1a3b08289DBcEa99A294197E9eB43b0e0325b4b';
        this.positionAddress = '0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067';
        this.positionsNFTAddress = '0x07b696af58c967c1b14c9dde0ace001720635a660a8e90c565ea459345318b30';

        this.coreAbi = require('./abi/core.json');
        this.positionAbi = require('./abi/position.json');
        this.positionsNFTAbi = require('./abi/positionNFT.json');

    };

    getCoreContract(account) {
        return getContract(this.coreAddress, this.coreAbi, account)
    };

    getPositionContract(account) {
        return getContract(this.positionAddress, this.positionAbi, account)
    };
    getPositionNFTContract(account) {
        return getContract(this.positionsNFTAddress, this.positionsNFTAbi, account)
    };

    computeFee(feePercentage) {
        // 将费率转换为BigNumber
        const feePercentageBigNumber = new BigNumber(feePercentage);

        // 计算2^128
        const scaleFactor = new BigNumber(2).pow(128);

        // 计算最终的费率值
        const scaledFee = feePercentageBigNumber.multipliedBy(scaleFactor).dividedBy(1000000);

        return scaledFee.toFixed();
    }


    getPoolKey(tokenA, tokenB, fee, tickSpacing) {
        const [token0, token1] = (tokenA < tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
        return {
            token0,
            token1,
            fee,
            tick_spacing: tickSpacing.toString(),
            extension: '0'
        }
    }

    getBounds(lower, upper, lowerSign = true, upperSign = true) {
        return {
            upper: { mag: upper, sign: upperSign },
            lower: { mag: lower, sign: lowerSign }

        };

    }

    async getPoolPrice(account, poolKey) {

        const coreContract = this.getCoreContract(account);
        const poolPrice = await coreContract.get_pool_price(poolKey);

        return {
            sqrt_ratio: poolPrice.sqrt_ratio,
            tick: Number(poolPrice.tick.mag)
        }

    }
    async getLPPositionIds(account) {
    };

    async getLPPositionInfo(account, tokenId, poolKey, bounds) {

        const positionContract = this.getPositionContract(account);
        return await positionContract.get_token_info(tokenId, poolKey, bounds);

    };


    async getLpPositions(account) {

        const url = `https://mainnet-api.ekubo.org/positions/${account.address}`;

        try {
            const response = await axios.get(url);
            const data = response.data.data;

            // 将 bounds 的 lower 和 upper 转换为 uint128
            const updatedData = data.map(item => ({
                ...item,
                bounds: {
                    lower: toUint128(item.bounds.lower),
                    upper: toUint128(item.bounds.upper)
                }
            }));

            return updatedData;
        } catch (error) {
            console.error('Error fetching LP position data:', error);
            return null;
        }
    }

    getMintLiquidityPositionCallData(account, poolKey, bounds, minLiquidity = '0') {
        const positionContract = this.getPositionContract(account);
        // 构建调用数据
        // 使用 populate 构建调用数据
        const callData = positionContract.populate(
            'mint_and_deposit',
            [
                poolKey,
                bounds,
                minLiquidity
            ]
        )

        return callData;

    };
    getDecreaseLiquidityCallData(account, tokenId, poolKey, bounds, liquidity = "4015767044046") {
        const positionContract = this.getPositionContract(account);

        const callData = positionContract.populate(
            'withdraw',
            [
                tokenId,
                poolKey,
                bounds,
                liquidity,
                '0',
                '0',
                '1'
            ]
        );
        return callData;
    };

    getBurnPositionCallData(account, tokenId) {
        const positionContract = this.getPositionContract(account);
        const callData = positionContract.populate(
            'unsafe_burn',
            [
                tokenId
            ]
        )
        return callData;

    };
    getClearCallData(account, tokenAddress) {
        console.log('tokenAddress: ', tokenAddress)
        const positionContract = this.getPositionContract(account);
        const callData = positionContract.populate(
            'clear',
            { token: tokenAddress }
        );
        return callData;
    }
    async mintLiquidityPosition(account, token0, token1, fee, tickSpacing, tickLower, tickUpper, amount0, amount1) {
        const poolKey = this.getPoolKey(token0, token1, fee, tickSpacing);
        const bounds = this.getBounds(tickLower, tickUpper);
        let multiCallData = [];
        if (Number(amount0) > 0) {
            const token0TransferCallData = gettokenTransferCallData(token0, this.positionAddress, amount0);
            multiCallData.push(token0TransferCallData)
        }
        if (Number(amount1) > 0) {
            const token1TransferCallData = gettokenTransferCallData(token1, this.positionAddress, amount1);
            multiCallData.push(token1TransferCallData)
        }

        const mintCallData = this.getMintLiquidityPositionCallData(account, poolKey, bounds);
        multiCallData.push(mintCallData)
        if (Number(amount0) > 0) {
            const token0ClearCallData = this.getClearCallData(account, token0);
            multiCallData.push(token0ClearCallData)
        }
        if (Number(amount1) > 0) {
            const token1ClearCallData = this.getClearCallData(account, token1);
            multiCallData.push(token1ClearCallData)
        }
        return await multiCallContract(account, multiCallData);
    };

    async decreaseLiquidityAndBurnPosition(account, tokenId, decreasePCT, token0, token1, fee, tickSpacing, tickLower, tickUpper) {
        const poolKey = this.getPoolKey(token0, token1, fee, tickSpacing);
        const bounds = this.getBounds(tickLower, tickUpper);
        const positionInfo = await this.getLPPositionInfo(account, tokenId, poolKey, bounds);
        const liquidityAmount = parseInt(Number(positionInfo.liquidity) * decreasePCT); // 流动性数量
        const decreaseLiquidityCallData = this.getDecreaseLiquidityCallData(account, tokenId, poolKey, bounds, liquidityAmount);
        const burnCallData = this.getBurnPositionCallData(account, tokenId);
        const multiCallData = [decreaseLiquidityCallData, burnCallData];
        return await multiCallContract(account, multiCallData);
    }


}

module.exports = Ekubo;
