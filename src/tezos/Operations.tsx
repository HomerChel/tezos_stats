import { TezosToolkit, OpKind } from '@taquito/taquito';

type priceInfo = {
  rowId: string,
  saleId: string | false,
  marketplace: string | false,
  faContract: string,
  tokenId: string,
  royalties: { recipient: string, amount: number }[],
  newPrice: string,
};

class Operations {
  tzAddress: string;
  tezos: TezosToolkit;
  contracts: { [index: string]: any };

  constructor(tzAddress: string, tezos: TezosToolkit) {
    this.tzAddress = tzAddress;
    this.tezos = tezos;
    this.contracts = {};
  }

  async addContract(contractAddress: string) {
    return await this.tezos.contract.at(contractAddress).then(contract => { this.contracts[contractAddress] = contract });
  }

  async getContract(contractAddress: string) {
    if (!this.contracts[contractAddress]) await this.addContract(contractAddress);
    return this.contracts[contractAddress];
  }

  async batchUpdatePrices(priceList: { [index: string]: priceInfo }, authorFee: number): Promise<any> {
    let operations = [];
    if (authorFee > 0) {
      operations.push({
        kind: OpKind.TRANSACTION,
        to: 'tz1e7JZvt4zmScKU7UVrKvHnpXjsQ6GJewV6', // account for tips
        amount: authorFee * 1000000,
        mutez: true,
      });
    }
    let objktContract = await this.tezos.contract.at('KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC');
    let henContract = await this.tezos.contract.at('KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn');
    let teiaContract = await this.tezos.contract.at('KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w');
    for (let key in priceList) {
      if (priceList[key].saleId) {
        // add retract ask operation
        if (priceList[key].marketplace === 'KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC') {
          operations.push({
            ...objktContract.methods.retract_ask(priceList[key].saleId).toTransferParams(),
            kind: OpKind.TRANSACTION,
            storageLimit: 0,
          });
        }
        if (priceList[key].marketplace === 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn') {
          operations.push({
            ...henContract.methods.cancel_swap(priceList[key].saleId).toTransferParams(),
            kind: OpKind.TRANSACTION,
            storageLimit: 0,
          });
        }
        if (priceList[key].marketplace === 'KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w') {
          operations.push({
            ...teiaContract.methods.cancel_swap(priceList[key].saleId).toTransferParams(),
            kind: OpKind.TRANSACTION,
            storageLimit: 0,
          });
        }
      }
      // add ask operation
      if (priceList[key].newPrice !== '') {
        let transferParams = objktContract.methods.ask(
          priceList[key].faContract,
          priceList[key].tokenId,
          Math.round(parseFloat(priceList[key].newPrice) * 1000000),
          1,
          priceList[key].royalties
        ).toTransferParams();
        // @ts-ignore
        transferParams.parameter.value.args[1].args[0] = {
          "prim": "Right",
          "args": [
            {
              "prim": "Right",
              "args": [
                {
                  "prim": "Unit"
                }
              ]
            }
          ]
        };
        operations.push({
          ...transferParams,
          kind: OpKind.TRANSACTION,
          storageLimit: 350,
          mutez: true,
        });

        // updating operators
        transferParams = (await this.getContract(priceList[key].faContract)).methods.update_operators([{
          add_operator: {
            owner: this.tzAddress,
            operator: 'KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC',
            token_id: priceList[key].tokenId
          }
        }]).toTransferParams();
        operations.push({
          kind: OpKind.TRANSACTION,
          ...transferParams,
          storageLimit: 100,
          mutez: true,
        });
      }

    }
    console.log(operations);
    // @ts-ignore
    let batch = this.tezos.wallet.batch(operations);
    return await batch.send();
  }

  async batchAllowOperators(nftsList: any[]):Promise<any> {
    let operations = [];
    for (let key in nftsList) {
      if (!nftsList[key].operatorError) continue;
      // updating operators
      let transferParams = (await this.getContract(nftsList[key].faContract)).methods.update_operators([{
        add_operator: {
          owner: this.tzAddress,
          operator: 'KT1WvzYHCNBvDSdwafTHv7nJ1dWmZ8GCYuuC',
          token_id: nftsList[key].tokenId
        }
      }]).toTransferParams();
      operations.push({
        kind: OpKind.TRANSACTION,
        ...transferParams,
        storageLimit: 100,
        mutez: true,
      });
    }
    // @ts-ignore
    let batch = this.tezos.wallet.batch(operations);
    return await batch.send();
  }
}

export default Operations