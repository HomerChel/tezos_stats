const axios = require('axios').default;
const { shortenTezosWalletAddress } = require('./Helpers.tsx');

class DataAPI {
  tzAddress: string;

  constructor(tzAddress: string) {
    this.tzAddress = tzAddress;
  }

  async balanceHistory() {
    const tzAddress = this.tzAddress;
    const hostname = 'api.tzstats.com';
    const path = `/series/balance?collapse=1d&address=${tzAddress}&start_date=`;
    let startTransactionTime = await this.firstTransactionTime();

    let data: Array<number[]>;
    let result: Array<{ x: number, y: number }> = [];

    while (result.length <= 0 || result[result.length - 1].x <= Date.now() - 24 * 60 * 60 * 1000) {
      data = await this.getRequest(hostname, path + startTransactionTime);

      data.forEach(function (value: Array<number>) {
        result.push({
          x: value[0],
          y: value[1],
        })
      })

      startTransactionTime = result[result.length - 1].x;
    }

    return result;
  }

  async firstTransactionTime() {
    const tzAddress = this.tzAddress;
    const hostname = 'api.tzstats.com';
    const path = '/tables/op?type=reveal&sender=' + tzAddress;

    let data = await this.getRequest(hostname, path);
    let time = Date.now();

    data.forEach((value) => {
      if (value[4] !== undefined && value[4] < time) time = value[4];
    });

    return (time);
  }

  async getNFTs() {
    const query = `
    query MyQuery($account: String = "") {
      token(where: {holders: {holder_address: {_eq: $account}, quantity: {_gt: "0"}}, fa_contract: {_nin: ["KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE", "KT1U6EHmNxJTkvaWJ4ThczG4FSDaHC21ssvi"]}, creators: {creator_address: {_neq: $account}}}, order_by: {timestamp: asc}) {
        fa_contract
        token_id
        display_uri
        name
        artifact_uri
        asks(
          order_by: {price: asc},
          where: {
            _or: [
              {
                status: {_eq: "active"},
                currency_id: {_eq: 1},
                seller: {
                  held_tokens: {
                    quantity: {_gt: "0"}
                  }
                }
              },
              {
                contract_version: {_lt: 4},
                status: {_eq: "active"}
              }
            ]
          }
        ) {
          price
          id
          seller_address
          amount
          contract_version
        }
        offers(limit: 20, order_by: {price: desc}, where: {status: {_eq: "active"}}) {
          id
          price
        }
        creators {
          creator_address
          holder {
            alias
          }
        }
        hen_swaps: hen_swaps(order_by: {price: asc}, where: {contract: {_eq: "KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn"}, status: {_eq: "active"}}) {
          amount
          price
          swap_id
          seller_address
        }
        teia_swaps: hen_swaps(order_by: {price: asc}, where: {contract: {_eq: "KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w"}, status: {_eq: "active"}}) {
          amount
          price
          swap_id
          seller_address
        }
        holders(where: {holder: {address: {_eq: $account}}}) {
          quantity
        }
        royalties {
          receiver_address
          amount
          decimals
        }
      }
    }`;

    let postData = JSON.stringify({
      query,
      variables: { account: this.tzAddress },
    });

    let res = await axios.post('https://data.objkt.com/v2/graphql', postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    })

    if (res.data) {
      console.log(res.data.data.token);
      try {
        let result = [];
        let summs = {user: 0, min: 0, offer: 0};
        for (let i = 0; i < res.data.data.token.length; i++) {
          let token = res.data.data.token[i];
          let min: number | false = false;
          if (token.asks.length > 0 && token.teia_swaps.length <= 0) {
            min = token.asks[0].price / 1000000;
          } else if (token.asks.length <= 0 && token.teia_swaps.length > 0) {
            min = token.teia_swaps[0].price / 1000000;
          } else if (token.asks.length > 0 && token.teia_swaps.length > 0) {
            min = Math.min(token.asks[0].price / 1000000, token.teia_swaps[0].price / 1000000);
          }
          let minHen: number | false = token.hen_swaps.length ? (token.hen_swaps[0].price / 1000000) : false;
          for (let j = 0; j < token.holders[0].quantity; j++) {
            let filtered = {
              name: '',
              link: '',
              creator: '',
              creatorlink: '',
              min: 0 as number | false,
              minHen: 0 as number | false,
              offer: 0,
              old: 0,
              market: '',
              saleId: '',
              marketplace: '',
              faContract: '',
              tokenId: '',
              royalties: [] as {recipient: string, amount: number}[],
            };
            filtered.name = token.name;
            filtered.link = `https://objkt.com/asset/${token.fa_contract}/${token.token_id}`;
            filtered.creator = token.creators[0].holder.alias ? token.creators[0].holder.alias : shortenTezosWalletAddress(token.creators[0].creator_address);
            filtered.creatorlink = `https://objkt.com/profile/${token.creators[0].creator_address}`;
            filtered.min = min;
            filtered.minHen = minHen;
            filtered.faContract = token.fa_contract;
            filtered.tokenId = token.token_id;
            filtered.offer = token.offers.length && token.offers.shift().price / 1000000;
            // royalties
            for (let royalty of token.royalties) {
              filtered.royalties.push({
                recipient: royalty.receiver_address,
                amount: 10000 * royalty.amount / Math.pow(10, royalty.decimals)
              });
            }
            // user prices
            for (let k = 0; k < token.asks.length; k++) {
              if (token.asks[k].seller_address === this.tzAddress) {
                filtered.old = token.asks[k].price / 1000000;
                filtered.market = 'Objkt';
                filtered.marketplace = 'KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC';
                filtered.saleId = token.asks[k].id;
                token.asks.splice(k, 1);
                break;
              }
            }
            if (!filtered.old) {
              for (let k = 0; k < token.hen_swaps.length; k++) {
                if (token.hen_swaps[k].seller_address === this.tzAddress) {
                  filtered.old = token.hen_swaps[k].price / 1000000;
                  filtered.market = 'HEN';
                  filtered.marketplace = 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn';
                  filtered.saleId = token.hen_swaps[k].swap_id;
                  token.hen_swaps.splice(k, 1);
                  break;
                }
              }
            }
            if (!filtered.old) {
              for (let k = 0; k < token.teia_swaps.length; k++) {
                if (token.teia_swaps[k].seller_address === this.tzAddress) {
                  filtered.old = token.teia_swaps[k].price / 1000000;
                  filtered.market = 'Teia';
                  filtered.marketplace = 'KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w';
                  filtered.saleId = token.teia_swaps[k].swap_id;
                  token.teia_swaps.splice(k, 1);
                  break;
                }
              }
            }
            summs.user += filtered.old;
            summs.min += (min !== false ? min : Number.MAX_VALUE) > (minHen !== false ? minHen : Number.MAX_VALUE) ? (minHen ? minHen : 0) : (min ? min : 0);
            summs.offer += filtered.offer;
            result.push(filtered);
          }
        }
        console.log(result);
        summs.user = +summs.user.toFixed(2);
        summs.min = +summs.min.toFixed(2);
        summs.offer = +summs.offer.toFixed(2);
        return {
          nftsList: result,
          summs: summs
        };
      } catch (e) {
        console.error('dataAPI getNFTs error: ', e);
        return {
          nftsList: [],
          summs: {user: 0, min: 0, offer: 0}
        };
      }
    }
    return {
      nftsList: [],
      summs: {user: 0, min: 0, offer: 0}
    };
  }

  async getRequest(hostname: string, path: string): Promise<Array<[]> | Array<any>> {
    return new Promise(function (resolve, reject) {
      axios.get('https://' + hostname + path,)
        .then(function (response: any) {
          resolve(response.data);
        })
        .catch(function (error: any) {
          reject(error);
        })
    }
    )
  }
}

export { DataAPI };