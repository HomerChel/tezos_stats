import axios from 'axios';

class FxhashDataApi {

  async getIncoming() {
    const query = `
      fragment Author on GenerativeToken {
        author {
          id
          name
          type
          avatarUri
          flag
          collaborators {
            id
            name
            avatarUri
            flag
            __typename
          }
          __typename
        }
        __typename
      }
      
      fragment Pricing on GenerativeToken {
        pricingFixed {
          price
          opensAt
          __typename
        }
        pricingDutchAuction {
          levels
          restingPrice
          finalPrice
          decrementDuration
          opensAt
          __typename
        }
        __typename
      }
      
      query GenerativeTokensIncoming($skip: Int, $take: Int, $sort: GenerativeSortInput, $filters: GenerativeTokenFilter) {
        generativeTokens(skip: $skip, take: $take, sort: $sort, filters: $filters) {
          id
          name
          slug
          flag
          labels
          thumbnailUri
          ...Pricing
          supply
          originalSupply
          balance
          enabled
          lockEnd
          royalties
          createdAt
          reserves {
            amount
            __typename
          }
          ...Author
          __typename
        }
      }`;

    let postData = JSON.stringify({
      query,
      variables: {
        "filters": {
          "flag_in": [
            "CLEAN",
            "NONE"
          ],
          "mintOpened_eq": false
        },
        "skip": 0,
        "sort": {
          "mintOpensAt": "ASC"
        },
        "take": 50
      },
    });

    let res = await axios.post('https://api.fxhash.xyz/graphql', postData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    })

    if (res.data && res.data.data && res.data.data.generativeTokens) {
      for (let i = 0; i < res.data.data.generativeTokens.length; i++) {
        res.data.data.generativeTokens[i].totalReserves = 0;
        for (let j = 0; j < res.data.data.generativeTokens[i].reserves.length; j++) {
          res.data.data.generativeTokens[i].totalReserves += res.data.data.generativeTokens[i].reserves[j].amount;
        }
      }
      return res.data.data.generativeTokens;
    }
    return false;
  }
}

export default FxhashDataApi;