import React, { useEffect } from 'react';
import FxhashDataApi from './tezos/FxhashDataApi'
// import { useOutletContext } from "react-router-dom";

function IncomingFxhash() {
  // let [tzAddress] = useOutletContext<any[]>();
  // let incomingList: { [key: string]: any; }[] = [];
  let [incomingList, setIncomingList] = React.useState<{ [key: string]: any; }[]>([]);

  let dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

  useEffect(() => {
    (new FxhashDataApi()).getIncoming().then(res => {
      if (res) {
        setIncomingList(res);
      }
    });
  }, []);

  return (
    <div className="container">
      {incomingList.map((art, index) => (
        <div key={index} className="flex row-auto p-2">
          <div className="p-2">
            <a href={'https://www.fxhash.xyz/generative/' + art.id} target="_blank" rel="noreferrer">
              <img
                className="w-40 h-40 object-contain border border-gray-700"
                src={'https://gateway.fxhash2.xyz/ipfs/' + art.thumbnailUri.substring(7)}
                alt={art.name} />
            </a>
          </div>
          <div className="p-2">
            <h3 className="font-bold"><a href={'https://www.fxhash.xyz/generative/' + art.id} target="_blank" rel="noreferrer">{art.name}</a></h3>
            <p>
              <a href={'https://www.fxhash.xyz/pkh/' + art.author.id} target="_blank" rel="noreferrer">{art.author.name} </a>
              {art.author.flag === "VERIFIED" ? <svg className="inline-block fill-green-300" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M6.26701 3.45496C6.91008 3.40364 7.52057 3.15077 8.01158 2.73234C9.15738 1.75589 10.8426 1.75589 11.9884 2.73234C12.4794 3.15077 13.0899 3.40364 13.733 3.45496C15.2336 3.57471 16.4253 4.76636 16.545 6.26701C16.5964 6.91008 16.8492 7.52057 17.2677 8.01158C18.2441 9.15738 18.2441 10.8426 17.2677 11.9884C16.8492 12.4794 16.5964 13.0899 16.545 13.733C16.4253 15.2336 15.2336 16.4253 13.733 16.545C13.0899 16.5964 12.4794 16.8492 11.9884 17.2677C10.8426 18.2441 9.15738 18.2441 8.01158 17.2677C7.52057 16.8492 6.91008 16.5964 6.26701 16.545C4.76636 16.4253 3.57471 15.2336 3.45496 13.733C3.40364 13.0899 3.15077 12.4794 2.73234 11.9884C1.75589 10.8426 1.75589 9.15738 2.73234 8.01158C3.15077 7.52057 3.40364 6.91008 3.45496 6.26701C3.57471 4.76636 4.76636 3.57471 6.26701 3.45496ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" /> </svg> : ''}
              {!!art.twitterHandle && <a href={'https://www.twitter.com/' + art.twitterHandle} target="_blank" rel="noreferrer"><svg className="inline-block fill-blue-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"> <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" /> </svg></a>}
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
                <p>{(new Date(art.pricingFixed.opensAt)).toLocaleDateString("ru-RU", dateOptions)}</p>
              </>}
            {!!art.pricingDutchAuction &&
              <>
                <p>{art.pricingDutchAuction.levels.map(
                  (level: number, index: number) => (<><span className='font-bold'>{level / 1000000} ꜩ</span>{index < art.pricingDutchAuction.levels.length - 1 ? ' -> ' : ''}</>)
                )}
                  <span className="text-gray-400"> ({art.royalties / 10}%)</span>
                </p>
                <p>{(new Date(art.pricingDutchAuction.opensAt)).toLocaleDateString("ru-RU", dateOptions)}</p>
              </>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncomingFxhash;
