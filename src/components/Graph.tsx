import { VictoryChart, VictoryLine, VictoryTheme } from "victory";

type chartProps = {
  data: Array<{x: number, y: number}>
}

function Graph(props: chartProps) {

  return (
    <div>
      <VictoryChart
        theme={VictoryTheme.material}
      >
        <VictoryLine
          style={{
            data: { stroke: "#c43a31" },
            parent: { border: "1px solid #ccc" }
          }}
          data={props.data}
        />
      </VictoryChart>
    </div>
  )
}

export { Graph }