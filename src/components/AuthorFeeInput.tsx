import { useState } from "react";

function AuthorFeeInput(props: { onChange: any }) {
  const { onChange } = props;
  // let value = 0.01;
  const [valid, setValid] = useState(true);

  function validate(value: string): Boolean {
    if (value === '') {
      setValid(true);
      return true;
    }
    if (/^\d*(\.{1}\d*){0,1}$/.test(value)) {
      setValid(true);
      return true;
    }
    setValid(false);
    return false;
  }

  return (
    <input
      id="authorFee"
      className={(valid ? "" : "bg-red-200 ") + "text-gray-900 w-44 text-right"}
      onChange={e => {console.log(e.target.value); onChange(e.target.value); validate(e.target.value)}}
    />
  )
}

export { AuthorFeeInput };