// import https from 'https-browserify';
const https = require('https-browserify');

class DataAPI {
  tzAddress: string;

  constructor(tzAddress: string) {
    this.tzAddress = tzAddress;
  }

  async balanceHistory() {
    const tzAddress = this.tzAddress;
    const hostname = 'api.tzstats.com';
    const time = await this.firstTransactionTime();
    const path = `/series/balance?start_date=${time}&collapse=1d&address=${tzAddress}`;

    let data: Array<number[]>;
    let result: Array<{x: number, y: number}> = [];

    data = await this.getRequest(hostname, path);

    data.forEach(function(value: Array<number>) {
      result.push({
        x: value[0],
        y: value[1],
      })
    })

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
      const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET'
      }

      const req = https.request(options, (res: any) => {
        let data = '';
        let result: any;

        res.on('data', (d: string) => {
          data += d;
        })

        res.on('end', () => {
          result = JSON.parse(data);

          resolve(result);
        })
      })

      req.on('error', (error: any) => {
        console.error(error)
      })

      req.end()
    }
  )}
}

export { DataAPI };