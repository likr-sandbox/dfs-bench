use js_sys::{Array, Object};
use petgraph::graph::{node_index, NodeIndex};
use wasm_bindgen::prelude::*;

type GraphType = petgraph::Graph<Object, Object, petgraph::Undirected, u32>;

#[wasm_bindgen]
pub struct GraphRust {
    graph: GraphType,
}

impl GraphRust {
    pub fn graph(&self) -> &GraphType {
        &self.graph
    }
}

#[wasm_bindgen]
impl GraphRust {
    #[wasm_bindgen(constructor)]
    pub fn new() -> GraphRust {
        GraphRust {
            graph: GraphType::with_capacity(0, 0),
        }
    }

    #[wasm_bindgen(js_name = addNode)]
    pub fn add_node(&mut self, value: JsValue) -> usize {
        let value = if value.is_null() || value.is_undefined() {
            Object::new().into()
        } else {
            value
        };
        self.graph.add_node(value.into()).index()
    }

    #[wasm_bindgen(js_name = addEdge)]
    pub fn add_edge(&mut self, u: usize, v: usize, value: JsValue) -> usize {
        let value = if value.is_null() || value.is_undefined() {
            Object::new().into()
        } else {
            value
        };
        let u = node_index(u);
        let v = node_index(v);
        self.graph.add_edge(u, v, value.into()).index()
    }

    #[wasm_bindgen(js_name = neighbors)]
    pub fn neighbors(&self, a: usize) -> Array {
        self.graph
            .neighbors(node_index(a))
            .map(|u| JsValue::from_f64(u.index() as f64))
            .collect::<Array>()
    }

    #[wasm_bindgen(js_name = nodeCount)]
    pub fn node_count(&self) -> usize {
        self.graph.node_count()
    }
}

fn dfs_rec(graph: &GraphType, u: NodeIndex, depth: &mut Vec<usize>) {
    for v in graph.neighbors(u) {
        if depth[v.index()] == 0 {
            depth[v.index()] = depth[u.index()] + 1;
            dfs_rec(graph, v, depth);
        }
    }
}

fn dfs(graph: &GraphType) -> Vec<usize> {
    let mut depth = vec![0; graph.node_count()];
    depth[0] = 1;
    dfs_rec(graph, node_index(0), &mut depth);
    depth
}

#[wasm_bindgen(js_name = dfsRustWithRust)]
pub fn dfs_rust(graph: &GraphRust) -> Array {
    dfs(&graph.graph)
        .into_iter()
        .map(|u| JsValue::from_f64(u as f64))
        .collect::<Array>()
}
