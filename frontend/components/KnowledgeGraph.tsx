"use client";

import { useEffect, useRef, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";

interface Node {
  id: string;
  label: string;
  timestamp: number;
}

interface Edge {
  source: string;
  target: string;
  type?: string | null;
}

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  activeTime: number;
  onNodeClick: (timestamp: number) => void;
}

export default function KnowledgeGraph({ nodes, edges, activeTime, onNodeClick }: KnowledgeGraphProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ ...e }))
  }), [nodes, edges]);

  const activeNodeId = useMemo(() => {
    const sorted = [...nodes].sort((a, b) => b.timestamp - a.timestamp);
    const active = sorted.find(n => activeTime >= n.timestamp);
    return active?.id;
  }, [nodes, activeTime]);

  return (
    <div className="w-full h-full relative bg-slate-900/20">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="label"
        nodeRelSize={6}
        linkColor={() => "rgba(59, 130, 246, 0.1)"}
        linkWidth={1.5}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        onNodeClick={(node: any) => {
          onNodeClick(node.timestamp as number);
        }}
        cooldownTime={3000}
        d3AlphaDecay={0.015}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;
          const isActive = node.id === activeNodeId;
          const label = node.label.toUpperCase();
          const fontSize = 11 / globalScale;

          ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;

          // 1. Draw Connection Glow (Shadow)
          if (isActive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "rgba(59, 130, 246, 0.8)";
          }

          // 2. Main Node Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = isActive ? "#3b82f6" : "rgba(255, 255, 255, 0.2)";
          ctx.fill();
          ctx.shadowBlur = 0;

          // 3. Node Border/Ring
          if (isActive) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
            ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
            ctx.lineWidth = 1 / globalScale;
            ctx.stroke();
          }

          // 4. Label
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (isActive) {
            ctx.fillStyle = "#3b82f6";
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          }

          if (globalScale > 1.2) {
            ctx.fillText(label, node.x, node.y + 14);
          }
        }}
      />

      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/5 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Active Node</span>
        </div>
      </div>
    </div>
  );
}
