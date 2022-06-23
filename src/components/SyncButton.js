function SyncButton(props) {
  return (
    <button onClick={props.onClick}>{props.text}</button>
  )
}

export {SyncButton};