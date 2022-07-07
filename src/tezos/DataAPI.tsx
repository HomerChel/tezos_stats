const https = require('https-browserify');
const axios = require('axios').default;

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
    let result: Array<{x: number, y: number}> = [];

    while (result.length <= 0 || result[result.length-1].x <= Date.now() - 24*60*60*1000) {
      data = await this.getRequest(hostname, path + startTransactionTime);

      data.forEach(function(value: Array<number>) {
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

    return(time);
  }

  async getRequest(hostname: string, path: string): Promise<Array<[]> | Array<any>> {
    return new Promise(function (resolve, reject) {
      axios.get('https://' + hostname + path, )
      .then(function (response: any) {
        resolve(response.data);
      })
      .catch(function (error: any) {
        reject(error);
      })
    }
  )}
}

export { DataAPI };