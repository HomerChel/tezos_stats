import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types';

// module.exports = {
  const tezos = new TezosToolkit('https://mainnet.api.tez.ie');

  const wallet = new BeaconWallet({
    name: 'MyAwesomeDapp',
    iconUrl: 'https://tezostaquito.io/img/favicon.svg',
    preferredNetwork: NetworkType.MAINNET,
    // eventHandlers: {
    //   PERMISSION_REQUEST_SUCCESS: {
    //     handler: async (data) => {
    //       console.log('permission data:', data);
    //     },
    //   },
    // },
  })

  export {tezos, wallet, NetworkType};