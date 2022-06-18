// import 'react-app-polyfill/stable';
import React from 'react';
import './App.css';
// import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

// const tezos = new TezosToolkit('https://mainnet.api.tez.ie');

function Button(props) {
  return (
    <button onClick={props.onClick}>{props.text}</button>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      synced: false
    }
  }

  sync() {
    const synced = this.state.synced;
    this.setState({
      synced: !synced 
    });
  }
  
  render() {
    return (
      <div className="App">
        <Button
          text={this.state.synced ? 'unsync' : 'sync'}
          onClick={() => this.sync()}
        />
      </div>
    );
  }
}

export default App;
