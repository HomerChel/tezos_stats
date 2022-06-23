import React from 'react';
import './App.css';
import {tezos, wallet} from './tezos/init';
import {SyncButton} from './components/SyncButton'
import {Graph} from './components/Graph'
import {Balance} from './components/Balance'
import {DataAPI} from './tezos/DataAPI'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      synced: false,
      tzAddress: null,
      balance: null,
      graphData: null,
    }
  }

  async sync() {
    const synced = this.state.synced;
    let tzAddress = null;
    if (!synced) {
      await wallet.requestPermissions({
        network: {
          type: 'mainnet',
        },
      });
      tezos.setWalletProvider(wallet);
      tzAddress = await wallet.getPKH();

      this.state.graphData = await (new DataAPI(tzAddress).balanceHistory());
    } else {
      wallet.clearActiveAccount();
    }
    this.updateBalance(tzAddress);
    this.setState({
      synced: !synced,
      tzAddress: tzAddress
    });
  }

  async updateBalance(tzAddress) {
    let balance;
    if (tzAddress) {
      balance = await tezos.tz.getBalance(tzAddress).then((b) => {return(`${b.toNumber() / 1000000} ꜩ`)});
    } else {
      balance = null;
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
