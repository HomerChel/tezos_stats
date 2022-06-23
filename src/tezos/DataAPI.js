import https from 'https-browserify';

class DataAPI {
  constructor(tzAddress) {
    this.tzAddress = tzAddress;
  }

  async balanceHistory() {
    const tzAddress = this.tzAddress;
    const hostname = 'api.tzstats.com';
    const time = await this.firstTransactionTime();
    const path = `/series/balance?start_date=${time}&collapse=1d&address=${tzAddress}`;


    let data = await this.getRequest(hostname, path);

    data.forEach(function(value, i, arr) {
      arr[i] = {
        x: value[0],
        y: value[1]
      }
    })

    return data;
  }

  async firstTransactionTime() {
    const tzAddress = this.tzAddress;
    const hostname = 'api.tzstats.com';
    const path = '/tables/op?type=reveal&sender=' + tzAddress;

    let data = await this.getRequest(hostname, path);
    let time = Date.now();
    
    data.forEach((value) => {
      if (value[4] < time) time = value[4];
    });

    return(time);
  }

  async getRequest(hostname, path) {
    return new Promise(function (resolve, reject) {
      const options = {
        hostname: hostname,
        port: 443,
        path: path,
        method: 'GET'
      }

      const req = https.request(options, res => {
        let data = '';

        res.on('data', d => {
          data += d;
        })

        res.on('end', d => {
          data = JSON.parse(data);

          resolve(data);
        })
      })

      req.on('error', error => {
        console.error(error)
      })

      req.end()
    }
  )}
}

export { DataAPI };