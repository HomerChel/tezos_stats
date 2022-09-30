import { useState } from "react";

function NewPriceInput(props: { rowId: string, saleId: string, marketplace: string, faContract: string, tokenId: string, royalties: {recipient: string, amount: number}[], onChange: any }) {
  const { rowId, saleId, marketplace, faContract, tokenId, royalties, onChange } = props;
  const [state, setState] = useState({valid: true});

  function handleChange(newPrice: string) {
    let priceInfo = {
      rowId: rowId,
      saleId: saleId,
      marketplace: marketplace,
      faContract: faContract,
      tokenId: tokenId,
      royalties: royalties,
      newPrice: newPrice,
    };
    onChange(priceInfo);
  }

  function validate(event: React.ChangeEvent<HTMLInputElement>): Boolean {
    let value = event.target.value;
    if (value === '') {
      setState({valid: true});
      return true;
    }
    if (/^\d*(\.{1}\d*){0,1}$/.test(value)) {
      setState({valid: true});
      return true;
    }
    setState({valid: false});
    return false;
  }

  return (
    <input
      className={(state.valid ? "" : "bg-red-200 ") + "text-gray-900 w-44 text-right"}
      onChange={e => {if (validate(e)) handleChange(e.target.value); else handleChange('')}}
    />
  )
}

export {NewPriceInput};