import React, { useEffect } from 'react';
import { tezos } from './tezos/init';
import { Button } from './components/Button'
import { NftsList } from './components/NftsList'
import { DataAPI } from './tezos/DataAPI'
import Operations from './tezos/Operations'
import { AuthorFeeInput } from './components/AuthorFeeInput'
import { useOutletContext } from "react-router-dom";

type priceInfo = {
  rowId: string,
  saleId: string | false,
  marketplace: string | false,
  faContract: string,
  tokenId: string,
  royalties: { recipient: string, amount: number }[],
  newPrice: string,
};

type objktNftState = {
  nftsList: Array<any>,
  summs: { user: number, min: number, offer: number },
  priceList: { [index: string]: priceInfo },
  authorFee: number,
  hasErrors: boolean,
}

function ReswapObjkt() {
  let [tzAddress] = useOutletContext<any[]>();
  let [state, setState] = React.useState<objktNftState>({
    nftsList: [],
    summs: { user: 0, min: 0, offer: 0 },
    priceList: {},
    authorFee: 0.01,
    hasErrors: false,
  });

  useEffect(() => {
    if (!tzAddress) return;
    (new DataAPI(tzAddress).getNFTs()).then(({ nftsList, summs, hasErrors }) => {
      setState({
        ...state,
        nftsList: nftsList,
        summs: summs,
        hasErrors: hasErrors
      });
    });
  }, [tzAddress]);

  function updatePrices(priceInfo: priceInfo) {
    let priceList = state.priceList;
    let authorFee = state.authorFee;

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

    authorFee = +(0.01 * Object.keys(priceList).length).toFixed(2);
    // @ts-ignore
    document.getElementById('authorFee').value = authorFee.toString();
    console.log(authorFee.toString());

    setState({
      ...state,
      priceList: priceList,
      authorFee: authorFee,
    });
  }

  async function sendBatch() {
    if (!Object.keys(state.priceList).length) return;
    console.log(state.priceList);
    if (!tzAddress) return;
    let operations = new Operations(tzAddress, tezos);
    let result = await operations.batchUpdatePrices(state.priceList, state.authorFee);
    console.log(result);
  }

  async function fixErrors() {
    if (!state.nftsList.length) return;
    if (!tzAddress) return;
    let operations = new Operations(tzAddress, tezos);
    let result = await operations.batchAllowOperators(state.nftsList);
    console.log(result);
  }

  return (
    <div className="container">
      {!!state.nftsList.length &&
        <NftsList
          nftsList={state.nftsList}
          summs={state.summs}
          updatePrices={(priceInfo: priceInfo) => updatePrices(priceInfo)}
        />
      }
      {!!state.nftsList.length &&
        <div className='grid grid-flow-col auto-cols-max items-center'>
          <div className='p-4 pl-0'>
            <Button
              text="update prices"
              onClick={() => sendBatch()}
            />
          </div>
          {state.hasErrors && 
          <div className='p-4 pl-0'>
            <Button
              text="fix errors"
              onClick={() => fixErrors()}
            />
          </div>}
          <div className='p-4'>
            <em className='px-4'>Tip for developer</em>
            <AuthorFeeInput
              onChange={
                (value: string) => {
                  if (/^\d*(\.{1}\d*){0,1}$/.test(value)) {
                    state.authorFee = parseFloat(value);
                  } else {
                    state.authorFee = 0.01;
                  }
                }
              }
            />
          </div>
        </div>
      }
    </div>
  );
}

export default ReswapObjkt;
