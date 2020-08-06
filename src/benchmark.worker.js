import { Suite } from "benchmark";
const wasm = import("dfs");

export class GraphJs {
  constructor() {
    this.nodes = new Map();
  }

  addNode(u, obj = {}) {
    this.nodes.set(u, {
      neighbors: new Map(),
      data: obj,
    });
    return this;
  }

  addEdge(u, v, obj = {}) {
    this.nodes.get(u).neighbors.set(v, obj);
    this.nodes.get(v).neighbors.set(u, obj);
    return this;
  }

  neighbors(u) {
    return this.nodes.get(u).neighbors.keys();
  }

  nodeCount() {
    return this.nodes.size;
  }
}

const rec = (graph, u, depth) => {
  for (const v of graph.neighbors(u)) {
    if (depth[v] === 0) {
      depth[v] = depth[u] + 1;
      rec(graph, v, depth);
    }
  }
};

const dfsJs = (graph) => {
  const depth = new Array(graph.nodeCount());
  depth.fill(0);
  depth[0] = 1;
  return rec(graph, 0, depth);
};

export const run = async (n, p) => {
  const { GraphRust, dfsRustWithRust, dfsRustWithJs } = await wasm;

  const edges = [];
  for (let u = 1; u < n; ++u) {
    for (let v = 0; v < u; ++v) {
      if (Math.random() < p) {
        edges.push([u, v]);
      }
    }
  }

  const graphJs = new GraphJs();
  const graphRust = new GraphRust();
  for (let u = 0; u < n; ++u) {
    graphJs.addNode(u);
    graphRust.addNode();
  }
  for (const [u, v] of edges) {
    graphJs.addEdge(u, v);
    graphRust.addEdge(u, v);
  }
  const results = new Suite()
    .add("js-js", () => {
      dfsJs(graphJs);
    })
    .add("rust-js", () => {
      dfsJs(graphRust);
    })
    .add("js-rust", () => {
      dfsRustWithJs(graphJs);
    })
    .add("rust-rust", () => {
      dfsRustWithRust(graphRust);
    })
    .run();
  return results.map((result) => {
    const [graphType, dfsType] = result.name.split("-");
    return {
      v: n,
      e: edges.length,
      graphType,
      dfsType,
      mean: result.stats.mean,
      count: result.count,
    };
  });
};
