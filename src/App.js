// import 'react-app-polyfill/stable';
import React from 'react';
import './App.css';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const tezos = new TezosToolkit('https://mainnet.api.tez.ie');

const options = {
  name: 'MyAwesomeDapp',
  iconUrl: 'https://tezostaquito.io/img/favicon.svg',
  preferredNetwork: 'mainnet',
  // eventHandlers: {
  //   PERMISSION_REQUEST_SUCCESS: {
  //     handler: async (data) => {
  //       console.log('permission data:', data);
  //     },
  //   },
  // },
};
const wallet = new BeaconWallet(options);

function Button(props) {
  return (
    <button onClick={props.onClick}>{props.text}</button>
  )
}

function Graph(props) {
  return (
    <div>{props.balance || '---'}</div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      synced: false,
      tzAddress: null,
      balance: null
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
        <Button
          text={this.state.synced ? 'unsync' : 'sync'}
          onClick={() => this.sync()}
        />
        <br />
        <Graph balance={this.state.balance} />
      </div>
    );
  }
}

export default App;
