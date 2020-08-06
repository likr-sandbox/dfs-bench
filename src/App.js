import React, { useState } from "react";
import worker from "./benchmark.worker";
import { ResponsiveLineCanvas } from "@nivo/line";

const { run } = worker();

const Chart = ({ records }) => {
  const data = [];
  for (const graphType of ["js", "rust"]) {
    for (const dfsType of ["js", "rust"]) {
      data.push({
        id: `${graphType}-${dfsType}`,
        data: records
          .filter(
            (record) =>
              record.graphType === graphType && record.dfsType === dfsType,
          )
          .map((record) => {
            return { x: record.e, y: record.mean * 1000 };
          }),
      });
    }
  }
  return (
    <div style={{ height: "600px" }}>
      <ResponsiveLineCanvas
        data={data}
        margin={{ top: 100, right: 10, bottom: 50, left: 60 }}
        xScale={{ type: "linear" }}
        yScale={{ type: "linear" }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "|E|",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "time (ms)",
          legendOffset: -50,
          legendPosition: "middle",
        }}
        colors={{ scheme: "category10" }}
        pointColor={{ theme: "background" }}
        pointBorderWidth={1}
        pointBorderColor={{ from: "serieColor" }}
        pointLabel="y"
        pointLabelYOffset={-12}
        isInteractive={false}
        useMesh={true}
        legends={[
          {
            anchor: "top-left",
            direction: "row",
            justify: false,
            translateX: 20,
            translateY: -20,
            itemsSpacing: 2,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 12,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export const App = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="content">
            <h1>DFS Benchmark with WebAssembly</h1>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="control">
            <button
              className={`button is-primary${loading ? " is-loading" : ""}`}
              onClick={async () => {
                setRecords([]);
                setLoading(true);
                const records = [];
                for (let n = 100; n <= 1000; n += 100) {
                  for (const result of await run(n, 0.1)) {
                    records.push(result);
                  }
                  setRecords(Array.from(records));
                }
                setLoading(false);
              }}
            >
              Run
            </button>
          </div>
          <div className="control">
            <Chart records={records} />
          </div>
          <div className="control">
            <table className="table is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th>|V|</th>
                  <th>|E|</th>
                  <th>Data Structure</th>
                  <th>DFS</th>
                  <th>Mean (ms)</th>
                  <th>Repeat</th>
                </tr>
              </thead>
              <tbody>
                {records.map((result, i) => {
                  return (
                    <tr key={i}>
                      <td>{result.v}</td>
                      <td>{result.e}</td>
                      <td>{result.graphType}</td>
                      <td>{result.dfsType}</td>
                      <td>{(result.mean * 1000).toFixed(3)}</td>
                      <td>{result.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
