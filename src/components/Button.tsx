function Button(props: {text: string, onClick: React.MouseEventHandler<HTMLButtonElement>}) {
  return (
    <button
      className="btn"
      onClick={props.onClick}
    >{props.text}</button>
  )
}

export {Button};