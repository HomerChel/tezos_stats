import React from 'react';
import { tezos, wallet, NetworkType } from './tezos/init';
import { Button } from './components/Button'
import { Balance } from './components/Balance'
import { Outlet } from "react-router-dom";

type rootProps = {};
type rootState = {
  synced: boolean,
  tzAddress: string | null,
  balance: string,
}

class Root extends React.Component<rootProps, rootState> {
  constructor() {
    super({});
    this.state = {
      synced: false,
      tzAddress: null, //'tz1YHaPUA5eTJq9NAJcDrZRsXhaDxuGsDNYd',
      balance: '',
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
    } else {
      wallet.clearActiveAccount();
    }
    this.updateBalance(tzAddress);

    console.log('here');
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

  render() {
    return (
      <div className="container mx-auto min-h-screen pb-[5rem] relative px-4">
        <div className="container py-4 columns-5">
          <Button
            text={this.state.synced ? 'unsync' : 'sync'}
            onClick={() => this.sync()}
          />
          {this.state.balance &&
            <Balance balance={this.state.balance} />
          }
        </div>
        <Outlet context={[this.state.tzAddress]} />
        <footer className="container py-4 absolute bottom-0">
          <p>
            Author: <a href="https://twitter.com/AAlternator" className="text-blue-300" target="_blank" rel="noreferrer">art_alternator</a>
          </p>
          <p>
            For donations: <span className="text-blue-300">tz1e7JZvt4zmScKU7UVrKvHnpXjsQ6GJewV6</span>
          </p>
        </footer>
      </div>
    );
  }
}

export default Root;
