import axios from 'axios';

class FxhashDataApi {

  async getTwitter(address: string): Promise<string | false> {
    const query = `
      query MyQuery {
        tzprofiles_by_pk(account: "${address}") {
          valid_claims
        }
      }`;

    let postData = JSON.stringify({
      query: query,
      variables: null,
      operationName: 'MyQuery'
    });

    let res = await axios.post('https://indexer.tzprofiles.com/v1/graphql', postData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    })

    if (res.data && res.data.data && res.data.data.tzprofiles_by_pk && res.data.data.tzprofiles_by_pk.valid_claims) {
      try {
        for (let i in res.data.data.tzprofiles_by_pk.valid_claims) {
          let info = JSON.parse(res.data.data.tzprofiles_by_pk.valid_claims[i][1]);
          if (info.evidence && info.evidence.tweetId) {
            return info.evidence.handle;
          }
        }
      } catch (e) {
        console.log(`Error while parsing tzProfiles for ${address}`, e);
        return false;
      }
    }
    return false;
  }

  async getIncoming(): Promise<{ [key: string]: any; }[] | false > {
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
      const promises = await res.data.data.generativeTokens.map(async (token: { [index: string]: any }): Promise<{ [index: string]: any }> => {
        token.twitterHandle = await this.getTwitter(token.author.id);
        return token;
      })
      const tokens = await Promise.all(promises);

      for (let i = 0; i < tokens.length; i++) {
        tokens[i].totalReserves = 0;
        for (let j = 0; j < tokens[i].reserves.length; j++) {
          tokens[i].totalReserves += tokens[i].reserves[j].amount;
        }
      }
      console.log(tokens);
      return tokens;
    }
    return false;
  }
}

export default FxhashDataApi;