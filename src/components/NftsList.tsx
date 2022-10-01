import { NewPriceInput } from './NewPriceInput';

type priceInfo = {
  rowId: string,
  saleId: string | false,
  marketplace: string | false,
  faContract: string,
  tokenId: string,
  royalties: {recipient: string, amount: number}[],
  newPrice: string,
};

function NftsList(props: { nftsList: Array<any>, updatePrices: Function }) {
  return (
    <div className="content-center w-full">
        <table className="table-auto border-spacing-1 border border-slate-400 border-separate">
          <thead>
            <tr>
              <th>Name</th>
              <th>Artist</th>
              <th>Old</th>
              <th>Min</th>
              <th>Min HEN</th>
              <th>New</th>
              <th>Offer</th>
            </tr>
          </thead>
          <tbody>
            {props.nftsList.map((nft, index) => (
              <tr id={'row-' + index} className="odd:bg-gray-900 even:bg-gray-800">
                <td className="p-2"><a target="_blank" href={nft.link}>{nft.name}</a></td>
                <td className="p-2"><a target="_blank" href={nft.creatorlink}>{nft.creator}</a></td>
                <td className="p-2">{nft.old ? nft.old + ' (' + nft.market + ')' : ''}</td>
                <td className="p-2">{nft.min !== false ? nft.min : ''}</td>
                <td className="p-2">{nft.minHen !== false ? nft.minHen : ''}</td>
                <td className="p-2">
                  <NewPriceInput
                    rowId={'row' + index}
                    saleId={nft.saleId}
                    marketplace={nft.marketplace}
                    faContract={nft.faContract}
                    tokenId={nft.tokenId}
                    royalties={nft.royalties}
                    onChange={(priceInfo: priceInfo) => props.updatePrices(priceInfo)}
                    />
                </td>
                <td className="p-2">{nft.offer ? nft.offer : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  )
}

export { NftsList }