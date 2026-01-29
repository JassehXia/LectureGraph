"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import ConceptList from "@/components/ConceptList";
const KnowledgeGraph = dynamic(() => import("@/components/KnowledgeGraph"), { ssr: false });
import { ArrowLeft, Share2, Info, List as ListIcon, Share2 as GraphIcon } from "lucide-react";
import Link from "next/link";

export default function LectureViewClient({ lecture }: { lecture: any }) {
    const [activeTime, setActiveTime] = useState(0);
    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
    const [viewMode, setViewMode] = useState<"list" | "graph">("graph");

    const handleConceptClick = (timestamp: number) => {
        setSeekTime(timestamp);
        // Reset seekTime immediately so subsequent clicks to same time still trigger
        setTimeout(() => setSeekTime(undefined), 100);
    };

    // Prepare edges from DB for the graph - MEMOIZED to prevent graph restarts
    const edges = useMemo(() => {
        return lecture.nodes?.flatMap((node: any) =>
            node.sourceEdges?.map((edge: any) => ({
                source: edge.sourceId,
                target: edge.targetId,
                type: edge.type
            }))
        ).filter(Boolean) || [];
    }, [lecture.nodes]);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Navbar */}
            <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white truncate max-w-md">{lecture.title}</h1>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-widest font-semibold font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live Transcript Synced
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mr-4">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <ListIcon className="w-3.5 h-3.5" />
                            Index
                        </button>
                        <button
                            onClick={() => setViewMode("graph")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${viewMode === 'graph' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <GraphIcon className="w-3.5 h-3.5" />
                            Graph
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share Graph
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* Left Side: Video */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="relative group rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] border border-white/5">
                        <VideoPlayer
                            src={lecture.url}
                            onTimeUpdate={setActiveTime}
                            seekTime={seekTime}
                        />
                    </div>

                    {/* Metadata/Transcript Snippet */}
                    <div className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/10">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Context Overview</h4>
                        <p className="text-slate-300 leading-relaxed italic">
                            "This lecture covers {lecture.nodes?.length > 0 ? lecture.nodes[0].label : 'key concepts'} and their practical applications.
                            The knowledge graph on the right provides a non-linear path to specific technical sections."
                        </p>
                    </div>
                </div>

                {/* Right Side: Tabbed Sidebar */}
                <div className="w-[500px] shrink-0 flex flex-col gap-4">
                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 overflow-hidden">
                        {viewMode === "list" ? (
                            <ConceptList
                                concepts={lecture.nodes || []}
                                activeTime={activeTime}
                                onConceptClick={handleConceptClick}
                            />
                        ) : (
                            <KnowledgeGraph
                                nodes={lecture.nodes || []}
                                edges={edges}
                                activeTime={activeTime}
                                onNodeClick={handleConceptClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
