"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { formatTime } from "@/lib/utils";
import ConceptList from "@/components/ConceptList";
import VideoPlayer from "@/components/VideoPlayer";
import { LayoutDashboard, Network, Sparkles, Activity, Search, Info, ChevronRight, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const KnowledgeGraph = dynamic(() => import("@/components/KnowledgeGraph"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs tracking-widest animate-pulse">BOOTING SPATIAL ENGINE...</div>
});

interface Node {
    id: string;
    label: string;
    definition: string;
    timestamp: number;
}

interface Edge {
    id: string;
    sourceId: string;
    targetId: string;
    type: string;
}

interface Lecture {
    id: string;
    title: string;
    r2Key: string;
    transcript?: string;
    nodes?: Node[];
    edges?: Edge[];
}

export default function LectureViewClient({ lecture }: { lecture: Lecture }) {
    const [activeTime, setActiveTime] = useState(0);
    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
    const [viewMode, setViewMode] = useState<"list" | "graph">("graph");

    const edges = useMemo(() => {
        return (lecture.edges || []).map(e => ({
            source: e.sourceId,
            target: e.targetId,
            type: e.type
        }));
    }, [lecture.edges]);

    const handleConceptClick = (time: number) => {
        setSeekTime(time);
        setTimeout(() => setSeekTime(undefined), 100);
    };

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Original Sleek Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-20 glass-panel flex items-center justify-between px-10 shrink-0 z-50 border-b border-white/5 shadow-2xl"
            >
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <BrainCircuit size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">LectureGraph</span>
                    </Link>

                    <div className="h-6 w-[1px] bg-slate-800" />

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Archive Node</span>
                        <h1 className="text-sm font-bold text-white truncate max-w-[300px]">{lecture.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Original View Toggle */}
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        {[
                            { id: 'list', icon: LayoutDashboard, label: 'List' },
                            { id: 'graph', icon: Network, label: 'Graph' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setViewMode(btn.id as any)}
                                className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all relative ${viewMode === btn.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {viewMode === btn.id && (
                                    <motion.div layoutId="nav-pill" className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20" />
                                )}
                                <btn.icon className="w-4 h-4 relative z-10" />
                                <span className="text-xs font-bold relative z-10">{btn.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-[1px] bg-slate-800" />

                    <div className="flex items-center gap-3">
                        <Sparkles className="text-blue-400 w-4 h-4" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Engine Stable</span>
                    </div>
                </div>
            </motion.nav>

            <div className="flex flex-1 overflow-hidden p-8 gap-8">
                {/* Left: Video Terminal */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1 flex flex-col min-w-0"
                >
                    <div className="flex-1 glass-panel rounded-[2rem] overflow-hidden shadow-2xl relative border-white/5 bg-black">
                        <VideoPlayer
                            src={`https://pub-34bc8f2e9d9449f69a86830caeb45256.r2.dev/${lecture.r2Key}`}
                            onTimeUpdate={setActiveTime}
                            seekTime={seekTime}
                        />
                    </div>
                </motion.div>

                {/* Right: Graph/List Terminal */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-[500px] flex flex-col"
                >
                    <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border-white/5 shadow-2xl shadow-blue-500/5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col overflow-hidden"
                            >
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
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Status Bar */}
            <div className="h-8 border-t border-white/5 flex items-center justify-between px-10 text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0 bg-slate-950/50">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        Network Live
                    </span>
                    <span>Lat: 24ms</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Recon v1.0.4</span>
                    <span>OS: Project Neo</span>
                </div>
            </div>
        </div>
    );
}
