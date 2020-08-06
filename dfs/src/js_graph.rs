use js_sys::Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen]
    pub type GraphJs;

    #[wasm_bindgen(method, js_class = "GraphJs", js_name = "neighbors")]
    pub fn neighbors(this: &GraphJs, u: usize) -> js_sys::Iterator;

    #[wasm_bindgen(method, js_class = "GraphJs", js_name = "nodeCount")]
    pub fn node_count(this: &GraphJs) -> usize;
}

fn dfs_rec(graph: &GraphJs, u: usize, depth: &mut Vec<usize>) {
    for v in graph
        .neighbors(u)
        .into_iter()
        .map(|v| v.ok().unwrap().as_f64().unwrap() as usize)
    {
        if depth[v] == 0 {
            depth[v] = depth[u] + 1;
            dfs_rec(graph, v, depth);
        }
    }
}

fn dfs(graph: &GraphJs) -> Vec<usize> {
    let mut depth = vec![0; graph.node_count()];
    depth.insert(0, 1);
    dfs_rec(graph, 0, &mut depth);
    depth
}

#[wasm_bindgen(js_name = dfsRustWithJs)]
pub fn dfs_js(graph: GraphJs) -> Array {
    dfs(&graph)
        .into_iter()
        .map(|u| JsValue::from_f64(u as f64))
        .collect::<Array>()
}
