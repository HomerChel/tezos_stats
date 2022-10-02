import React from 'react';
import { tezos, wallet, NetworkType } from './tezos/init';
import { Button } from './components/Button'
import { Graph } from './components/Graph'
import { Balance } from './components/Balance'
import { NftsList } from './components/NftsList'
import { DataAPI } from './tezos/DataAPI'
import Operations from './tezos/Operations'
import { AuthorFeeInput } from './components/AuthorFeeInput'

type priceInfo = {
  rowId: string,
  saleId: string | false,
  marketplace: string | false,
  faContract: string,
  tokenId: string,
  royalties: { recipient: string, amount: number }[],
  newPrice: string,
};
type appProps = {};
type appState = {
  synced: boolean,
  tzAddress: string | null,
  balance: string,
  nftsList: Array<any>,
  graphData: Array<{ x: number, y: number }> | null,
  priceList: { [index: string]: priceInfo },
  authorFee: number,
}

class App extends React.Component<appProps, appState> {
  constructor() {
    super({});
    this.state = {
      synced: false,
      tzAddress: null,
      balance: '',
      nftsList: [],
      graphData: null,
      priceList: {},
      authorFee: 0.01,
    }
  }

  async sync() {
    const synced = this.state.synced;
    let tzAddress = null;
    if (!synced) {
      await wallet.requestPermissions({
        network: {
          type: NetworkType.MAINNET,
        },
      });
      tezos.setWalletProvider(wallet);
      tzAddress = await wallet.getPKH();

      // this.setState({
      //   graphData: await (new DataAPI(tzAddress).balanceHistory())
      // });

      this.setState({
        nftsList: await (new DataAPI(tzAddress).getNFTs())
      });
    } else {
      wallet.clearActiveAccount();
      this.setState({
        nftsList: [],
        priceList: {},
      });
    }
    this.updateBalance(tzAddress);
    this.setState({
      synced: !synced,
      tzAddress: tzAddress
    });
  }

  async updateBalance(tzAddress: string | null) {
    let balance: string;
    if (tzAddress) {
      balance = await tezos.tz.getBalance(tzAddress).then((b) => { return (`${(b.toNumber() / 1000000).toFixed(2)} ꜩ`) });
    } else {
      balance = '';
    }
    this.setState({
      balance: balance
    });
  }

  updatePrices(priceInfo: priceInfo) {
    let priceList = this.state.priceList;
    let authorFee = this.state.authorFee;

    if (priceInfo.newPrice === '' && priceList[priceInfo.rowId]) {
      delete priceList[priceInfo.rowId];
    } else {
      priceList[priceInfo.rowId] = {
        rowId: priceInfo.rowId,
        saleId: priceInfo.saleId ? priceInfo.saleId : false,
        marketplace: priceInfo.marketplace ? priceInfo.marketplace : false,
        faContract: priceInfo.faContract,
        tokenId: priceInfo.tokenId,
        royalties: priceInfo.royalties,
        newPrice: priceInfo.newPrice,
      }
    }

    authorFee = 0.01 * Object.keys(priceList).length;
    // @ts-ignore
    let res = document.getElementById('authorFee').value = authorFee.toString();
    console.log(authorFee.toString());

    this.setState({
      priceList: priceList,
      authorFee: authorFee,
    });
  }

  async sendBatch() {
    let priceList = this.state.priceList;
    if (!Object.keys(priceList).length) return;
    console.log(priceList);
    if (!this.state.tzAddress) return;
    let operations = new Operations(this.state.tzAddress, tezos);
    let result = await operations.batchUpdatePrices(priceList, this.state.authorFee);
    console.log(result);
  }

  render() {
    return (
      <div className="container mx-auto">
        <div className="container py-4 columns-5">
          <Button
            text={this.state.synced ? 'unsync' : 'sync'}
            onClick={() => this.sync()}
          />
          {this.state.balance &&
            <Balance balance={this.state.balance} />
          }
        </div>
        <div className="container">
          {!!this.state.nftsList.length &&
            <NftsList
              nftsList={this.state.nftsList}
              updatePrices={(priceInfo: priceInfo) => this.updatePrices(priceInfo)}
            />
          }
          {/* {this.state.graphData &&
            <Graph data={this.state.graphData} />
          } */}
          {!!this.state.nftsList.length &&
            <div className='grid grid-flow-col auto-cols-max items-center'>
              <div className='p-4 pl-0'>
                <Button
                  text="update prices"
                  onClick={() => this.sendBatch()}
                />
              </div>
              <div className='p-4'>
                <em className='px-4'>Tip for developer</em>
                <AuthorFeeInput
                  onChange={
                    (value: string) => {
                      if (/^\d*(\.{1}\d*){0,1}$/.test(value)) {
                        this.setState({ authorFee: parseFloat(value) })
                      } else {
                        this.setState({ authorFee: 0.01 })
                      }
                    }
                  }
                />
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
