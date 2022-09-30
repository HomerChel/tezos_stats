function Balance(props: {balance: string}) {
  return (
    <div className="p-4 w-full">
      {props.balance}
    </div>
  )
}

export {Balance}