"use client";

import { useEffect, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface Node {
  id: string;
  label: string;
  timestamp: number;
}

interface Edge {
  source: string;
  target: string;
  type?: string;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  activeTime: number;
  onNodeClick: (timestamp: number) => void;
}

export default function KnowledgeGraph({ nodes, edges, activeTime, onNodeClick }: KnowledgeGraphProps) {
  const fgRef = useRef<any>();

  // Format data for react-force-graph
  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ ...e }))
  }), [nodes, edges]);

  // Find the active node based on the current video time
  const activeNodeId = useMemo(() => {
    const sorted = [...nodes].sort((a, b) => b.timestamp - a.timestamp);
    const active = sorted.find(n => activeTime >= n.timestamp);
    return active?.id;
  }, [nodes, activeTime]);

  // Handle graph centering on active node
  useEffect(() => {
    if (activeNodeId && fgRef.current) {
      const node = graphData.nodes.find(n => n.id === activeNodeId);
      if (node) {
        // Subtle pan to active node if it's too far from center
        // fgRef.current.centerAt(node.x, node.y, 1000);
      }
    }
  }, [activeNodeId, graphData]);

  return (
    <div className="w-full h-full bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="label"
        nodeColor={node => (node.id === activeNodeId ? "#3b82f6" : "#475569")}
        nodeRelSize={6}
        linkColor={() => "rgba(255, 255, 255, 0.1)"}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => onNodeClick(node.timestamp)}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.id === activeNodeId ? "#3b82f6" : "#475569";
          ctx.fill();

          // Highlight glow for active node
          if (node.id === activeNodeId) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#3b82f6";
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          // Draw Label
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = node.id === activeNodeId ? "#ffffff" : "#94a3b8";
          ctx.fillText(label, node.x, node.y + 10);
        }}
      />
    </div>
  );
}
