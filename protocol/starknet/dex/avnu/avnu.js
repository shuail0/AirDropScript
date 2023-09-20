/**
 * 项目名: avnu.fi
 * 项目地址：https://www.avnu.fi/
 * 项目文档：https://doc.avnu.fi/
 * 已经完成接口： swap
 */

const { getApproveCallData } = require('../../../../base/coin/stkToken.js');
const { multiCallContract, getContract, bigIntToHex, floatToUint256, multiplyUint256ByFraction, addSecondsToCurrentTimestamp, bigNumbetToUint256, uint256ToBigNumber, feltToStr, feltToInt, bigIntToBigNumber } = require('../../../../base/stkUtils.js');
const axios = require('axios')
const qs = require('qs');
const {toBeHex} = require('../../../../base/utils.js');
class Avnu {
    constructor(){
        // this.basUrl = 'https://goerli.api.avnu.fi'
        this.basUrl = 'https://starknet.api.avnu.fi'
        this.routerAddr = '0x010884171baf1914edc28d7afb619b40a4051cfae78a094a55d230f19e944a28',
        // this.routerAbi = require('./abi/router.json');
        this.zeroUint256 = floatToUint256(0)
    };


    getRouterContract(account, routerAddr=this.routerAddr, routerAbi=this.routerAbi){
        return getContract(routerAddr, routerAbi, account);
    };
    parseResponse(response, avnuPublicKey) {
        if (response.status === 400) {
          return response.json().then(error => {
            throw new Error(error.messages[0]);
          });
        }
        if (response.status > 400) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        if (avnuPublicKey) {
          const signature = response.headers.get('signature');
          if (!signature) throw new Error('No server signature');
          return response
            .clone()
            .text()
            .then(textResponse => {
              const hashResponse = hash.computeHashOnElements([hash.starknetKeccak(textResponse)]);
              const formattedSig = signature.split(',').map(s => BigInt(s));
              const signatureType = new ec.starkCurve.Signature(formattedSig[0], formattedSig[1]);
              if (!ec.starkCurve.verify(signatureType, hashResponse, avnuPublicKey))
                throw new Error('Invalid server signature');
            })
            .then(() => response.json());
        }
        return response.json();
      };

    async getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn, slippage=0.05){
      const quotes = await this.getQuote(account, tokenIn, tokenOut, amountIn);
      const quoteId = quotes[0].quoteId;
      const takerAddress = account.address;
      const response = await fetch(`${this.basUrl}/swap/v1/build`, {
          method: 'POST',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quoteId, takerAddress, slippage }),
      });
      return await this.parseResponse(response);
    };

    async getQuote(account, tokenIn, tokenOut, amountIn){
        /**
         * 获取报价，用于交易;
         * amountA: tokenA的数量
         * reserveA: tokenA在Pool中的储备数量
         * reserveB: tokenB在Pool中的储备数量
         */
        const params = {
            sellTokenAddress: tokenIn,
            buyTokenAddress: tokenOut,
            sellAmount: toBeHex(amountIn),
            takerAddress: account.address,
        } ;
        const queryParams = qs.stringify(
            {
                ...params,
                integratorFees: params.integratorFees ? toBeHex(params.integratorFees) : undefined,
            },
            { arrayFormat: 'repeat' },
          );

        const response = await fetch(`${this.basUrl}/swap/v1/quotes?${queryParams}`);

        const quotes = await this.parseResponse(response);
        return quotes.map(quote => ({
            ...quote,
            sellAmount: BigInt(quote.sellAmount),
            buyAmount: BigInt(quote.buyAmount),
            avnuFees: BigInt(quote.avnuFees),
            integratorFees: BigInt(quote.integratorFees),
            avnuFeesBps: BigInt(quote.avnuFeesBps),
            integratorFeesBps: BigInt(quote.integratorFeesBps),
            suggestedSolution: quote.suggestedSolution
              ? {
                  ...quote.suggestedSolution,
                  sellAmount: BigInt(quote.suggestedSolution.sellAmount),
                  buyAmount: BigInt(quote.suggestedSolution.buyAmount),
                }
              : undefined,
          }));
        
    };
    async swapTokenToToken(account, tokenIn, tokenOut, amountIn) {
        const swapCallData = await this.getSwapTokenToTokenCallData(account, tokenIn, tokenOut, amountIn);
        const approveCallData = getApproveCallData(tokenIn, swapCallData.contractAddress, amountIn);
        const multiCallData = [approveCallData, swapCallData];
        return await multiCallContract(account, multiCallData);
    };
};

module.exports = Avnu;
