import React from 'react';
import {tezos, wallet, NetworkType} from './tezos/init';
import {SyncButton} from './components/SyncButton'
import {Graph} from './components/Graph'
import {Balance} from './components/Balance'
import {DataAPI} from './tezos/DataAPI'

type appProps = {};
type appState = {
  synced: boolean,
  tzAddress: string | null,
  balance: string,
  graphData: Array<{x: number, y: number}> | null,
}

class App extends React.Component<appProps, appState> {
  constructor() {
    super({});
    this.state = {
      synced: false,
      tzAddress: null,
      balance: '',
      graphData: null,
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

      this.setState({
        graphData: await (new DataAPI(tzAddress).balanceHistory())
      });
    } else {
      wallet.clearActiveAccount();
    }
    this.updateBalance(tzAddress!);
    this.setState({
      synced: !synced,
      tzAddress: tzAddress
    });
  }

  async updateBalance(tzAddress: string) {
    let balance: string;
    if (tzAddress) {
      balance = await tezos.tz.getBalance(tzAddress).then((b) => {return(`${(b.toNumber() / 1000000).toFixed(2)} ꜩ`)});
    } else {
      balance = '';
    }
    this.setState({
      balance: balance
    });
  }
  
  render() {
    return (
      <div className="App">
        <SyncButton
          text={this.state.synced ? 'unsync' : 'sync'}
          onClick={() => this.sync()}
        />
        <br />
        {this.state.balance &&
          <Balance balance={this.state.balance} />
        }
        {this.state.graphData &&
          <Graph data={this.state.graphData}/>
        }
      </div>
    );
  }
}

export default App;
