import React, { useState, useCallback, useEffect, useRef } from "react";
import jp from "jsonpath";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import SearchBar from "./SearchBar";
import "./JsonTree.css";
import * as htmlToImage from "html-to-image";

const NODE_W = 160;
const NODE_H = 56;

const getLayoutedElements = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB" });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const nd = g.node(node.id);
      return {
        ...node,
        position: { x: nd.x - NODE_W / 2, y: nd.y - NODE_H / 2 },
      };
    }),
    edges,
  };
};

const createTreeFromJson = (data, parentId = null, nodes = [], edges = [], key = "root", nodeId = "root", theme = "light") => {
  if (typeof data === "object" && data !== null) {
    const isArray = Array.isArray(data);

    const bgColor = theme === "dark"
      ? (isArray ? "var(--array-dark)" : "var(--object-dark)")
      : (isArray ? "var(--array-light)" : "var(--object-light)");

    const label = `${key} (${isArray ? "Array" : "Object"})`;

    nodes.push({
      id: nodeId,
      data: { label, path: nodeId.replace(/^root/, "$") },
      position: { x: 0, y: 0 },
      style: { backgroundColor: bgColor, color: "#fff", borderRadius: 8 },
    });

    if (parentId) edges.push({ id: `e-${parentId}-${nodeId}`, source: parentId, target: nodeId });

    if (isArray) {
      data.forEach((item, idx) => {
        const childId = `${nodeId}[${idx}]`;
        const childKey = `${key}[${idx}]`;
        if (typeof item === "object" && item !== null) {
          createTreeFromJson(item, nodeId, nodes, edges, childKey, childId, theme);
        } else {
          nodes.push({
            id: childId,
            data: { label: `${idx}: ${String(item)}`, path: childId.replace(/^root/, "$"), value: item },
            position: { x: 0, y: 0 },
            style: { backgroundColor: theme === "dark" ? "var(--primitive-dark)" : "var(--primitive-light)", color: theme === "dark" ? "#072" : "#052" , borderRadius: 8 },
          });
          edges.push({ id: `e-${nodeId}-${childId}`, source: nodeId, target: childId });
        }
      });
    } else {
      Object.entries(data).forEach(([childKey, value]) => {
        const childId = `${nodeId}.${childKey}`;
        if (typeof value === "object" && value !== null) {
          createTreeFromJson(value, nodeId, nodes, edges, childKey, childId, theme);
        } else {
          nodes.push({
            id: childId,
            data: { label: `${childKey}: ${String(value)}`, path: childId.replace(/^root/, "$"), value },
            position: { x: 0, y: 0 },
            style: { backgroundColor: theme === "dark" ? "var(--primitive-dark)" : "var(--primitive-light)", color: theme === "dark" ? "#072" : "#052", borderRadius: 8 },
          });
          edges.push({ id: `e-${nodeId}-${childId}`, source: nodeId, target: childId });
        }
      });
    }
  } else {
    nodes.push({
      id: nodeId,
      data: { label: String(data), path: nodeId.replace(/^root/, "$"), value: data },
      position: { x: 0, y: 0 },
      style: { backgroundColor: theme === "dark" ? "var(--primitive-dark)" : "var(--primitive-light)", color: theme === "dark" ? "#072" : "#052", borderRadius: 8 },
    });
    if (parentId) edges.push({ id: `e-${parentId}-${nodeId}`, source: parentId, target: nodeId });
  }
  return { nodes, edges };
};

const JsonTreeInner = ({ jsonData, theme = "light", onReset }) => {
  const { setCenter } = useReactFlow();
  const containerRef = useRef(null);
  const initialRef = useRef({ nodes: [], edges: [] });
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [message, setMessage] = useState(""); 
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!jsonData) {
      setNodes([]);
      setEdges([]);
      initialRef.current = { nodes: [], edges: [] };
      setMessage("");
      return;
    }
    const { nodes: raw, edges: rawE } = createTreeFromJson(jsonData, null, [], [], "root", "root", theme);
    const layouted = getLayoutedElements(raw, rawE);
    initialRef.current = layouted;
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setMessage("");
  }, [jsonData, theme]);

  // convert jsonpath path array -> node id used in tree
  const jsonPathArrayToNodeId = (pathArray) => {
    const joined = pathArray.map((p) => (typeof p === "string" ? p : p.toString())).join(".");
    const asRoot = joined.replace(/^\$/, "root");
    const withIndexes = asRoot.replace(/\.(\d+)(?=\.|$)/g, "[$1]");
    return withIndexes;
  };

  const applySearch = useCallback((query) => {
    if (!query || !query.trim()) {
      setNodes(initialRef.current.nodes);
      setEdges(initialRef.current.edges);
      setMessage("");
      return;
    }

    try {
      const paths = jp.paths(jsonData, query.trim());
      if (!paths || paths.length === 0) {
        setNodes(initialRef.current.nodes);
        setEdges(initialRef.current.edges);
        setMessage(
  <span style={{ color: "red" }}>
    <i className="fa-solid fa-xmark" style={{ marginRight: "6px" ,color:"red"}}></i>
    No match found
  </span>
);

        return;
      }

      const matched = paths.map(jsonPathArrayToNodeId);
      const updated = initialRef.current.nodes.map((n) => {
        const isMatch = matched.includes(n.id);
        return {
          ...n,
          style: {
            ...n.style,
            border: isMatch ? `3px solid ${getComputedStyle(document.documentElement).getPropertyValue('--highlight') || '#FFE066'}` : (n.style?.border || "none"),
            boxShadow: isMatch ? `0 0 12px ${getComputedStyle(document.documentElement).getPropertyValue('--highlight') || '#FFE066'}` : (n.style?.boxShadow || "none"),
          },
        };
      });

      setNodes(updated);
      setEdges(initialRef.current.edges);
      setMessage(
  <span style={{ color: "green" }}>
    <i className="fa-solid fa-check" style={{ marginRight: "6px" }}></i>
    Match found: {matched.length}
  </span>
);


      // center on first matched
      const first = updated.find((n) => matched.includes(n.id));
      if (first && first.position) {
        setTimeout(() => setCenter(first.position.x, first.position.y, { zoom: 1.5 }), 260);
      }
    } catch (err) {
      console.warn("jsonpath error", err);
      setNodes(initialRef.current.nodes);
      setEdges(initialRef.current.edges);
      setMessage("⚠ Invalid JSONPath");
    }
  }, [jsonData, setCenter]);

  // copy path on node click
  const onNodeClick = useCallback((ev, node) => {
    const id = node?.id;
    if (!id) return;
    const jsonPath = id.replace(/root/g, "$").replace(/\[(\d+)\]/g, "[$1]");
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonPath).then(() => {
        setToast({ text: `Copied: ${jsonPath}`, color: "#4ade80" });
        setTimeout(() => setToast(null), 1600);
      });
    } else {
      setToast({ text: `Copy: ${jsonPath}`, color: "#f59e0b" });
      setTimeout(() => setToast(null), 1600);
    }
  }, []);

  const onDownloadPNG = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      setToast({ text: "Rendering PNG...", color: "#fbbf24" });
      const dataUrl = await htmlToImage.toPng(containerRef.current, { cacheBust: true, backgroundColor: null });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "json-tree.png";
      a.click();
      setToast({
        text: (
          <span style={{ color: "#4ade80" }}>
            <i className="fa-solid fa-check" style={{ marginRight: "6px" }}></i>
              Downloaded PNG
          </span>
            ),
          });

      setTimeout(() => setToast(null), 1500);
    } catch (e) {
      console.error(e);
      setToast({ text: "Export failed", color: "#ff7b7b" });
      setTimeout(() => setToast(null), 2000);
    }
  }, []);

  return (
    <>
      <div className={`json-tree-panel ${theme}`} ref={containerRef}>
        <div className="search-row">
          <div style={{ flex: 1 }}>
            <SearchBar onSearch={applySearch} theme={theme} />
            {message && <div className="search-message">{message}</div>}
          </div>

          <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
            <button className="small-btn" onClick={() => { setNodes(initialRef.current.nodes); setEdges(initialRef.current.edges); setMessage(""); }}>
              Reset Tree
            </button>
            <button className="small-btn" onClick={onDownloadPNG}>Download PNG</button>
          </div>
        </div>

        <div className="tree-canvas">
          <ReactFlow nodes={nodes} edges={edges} fitView onNodeClick={onNodeClick}>
            <MiniMap nodeStrokeColor={(n) => n.style?.backgroundColor || "#999"} nodeColor={(n) => n.style?.backgroundColor || "#ddd"} nodeBorderRadius={6} />
            <Background gap={16} size={1} />
            <Controls />
          </ReactFlow>
        </div>

        <div className="legend">
          <span className="legend-item object">Object</span>
          <span className="legend-item array">Array</span>
          <span className="legend-item primitive">Key: Value</span>
        </div>

        {toast && <div className="toast" style={{ background: toast.color || "#333" }}>{toast.text}</div>}
      </div>
    </>
  );
};

const JsonTree = ({ jsonData, theme = "light", onReset }) => (
  <div style={{ height: "100%" }}>
    <ReactFlowProvider>
      <JsonTreeInner jsonData={jsonData} theme={theme} onReset={onReset} />
    </ReactFlowProvider>
  </div>
);

export default JsonTree;
