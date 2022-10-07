import React, { useEffect } from 'react';
import FxhashDataApi from './tezos/FxhashDataApi'
// import { useOutletContext } from "react-router-dom";

function IncomingFxhash() {
  // let [tzAddress] = useOutletContext<any[]>();
  // let incomingList: { [key: string]: any; }[] = [];
  let [incomingList, setIncomingList] = React.useState<{ [key: string]: any; }[]>([]);

  let dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

  useEffect(() => {
    (new FxhashDataApi().getIncoming()).then(res => {
      setIncomingList(res);
      console.log(res);
    });
  }, []);

  return (
    <div className="container">
      {incomingList.map((art, index) => (
        <div key={index} className="flex row-auto p-2">
          <div className="p-2">
            <a href={'https://www.fxhash.xyz/generative/' + art.id} target="_blank" rel="noreferrer">
              <img src={'https://gateway.fxhash2.xyz/ipfs/' + art.thumbnailUri.substring(7)} alt={art.name} />
            </a>
          </div>
          <div className="p-2">
            <h3 className="font-bold"><a href={'https://www.fxhash.xyz/generative/' + art.id} target="_blank" rel="noreferrer">{art.name}</a></h3>
            <p>
              <a href={'https://www.fxhash.xyz/pkh/' + art.author.id} target="_blank" rel="noreferrer">{art.author.name}</a>
              {art.author.flag === "VERIFIED" ? <span className="text-blue-400 text-xl font-bold"> ✓</span> : ''}
            </p>
            <p>
              x{art.supply} {!!art.totalReserves && <span className="text-gray-400">({art.totalReserves} in reserve)</span>}
            </p>
            {!!art.pricingFixed &&
              <>
                <p>
                  Fixed: <span className='font-bold'>{art.pricingFixed.price / 1000000} ꜩ</span>
                  <span className="text-gray-400"> ({art.royalties / 10}%)</span>
                </p>
                <p>{(new Date(art.pricingFixed.opensAt)).toLocaleDateString("en-GB", dateOptions)}</p>
              </>}
            {!!art.pricingDutchAuction &&
              <>
                <p>{art.pricingDutchAuction.levels.map(
                  (level: number, index: number) => (<><span className='font-bold'>{level / 1000000} ꜩ</span>{index < art.pricingDutchAuction.levels.length - 1 ? ' -> ' : ''}</>)
                )}
                  <span className="text-gray-400"> ({art.royalties / 10}%)</span>
                </p>
                <p>{(new Date(art.pricingDutchAuction.opensAt)).toLocaleDateString("en-GB", dateOptions)}</p>
              </>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomingFxhash;
