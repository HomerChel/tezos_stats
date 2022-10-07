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
      tzAddress: null,
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
          <Outlet context={[this.state.tzAddress]}/>
      </div>
    );
  }
}

export default Root;
