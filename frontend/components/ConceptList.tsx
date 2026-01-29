"use client";

import { Clock, ChevronRight, Activity, Search } from "lucide-react";
import { formatTime, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface Node {
    id: string;
    label: string;
    definition: string;
    timestamp: number;
}

interface ConceptListProps {
    concepts: Node[];
    activeTime: number;
    onConceptClick: (timestamp: number) => void;
}

export default function ConceptList({ concepts, activeTime, onConceptClick }: ConceptListProps) {
    const [search, setSearch] = useState("");

    const filteredConcepts = concepts.filter(c =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.definition.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.timestamp - b.timestamp);

    const activeIndex = concepts.findIndex((c, i) => {
        const nextTime = concepts[i + 1]?.timestamp || Infinity;
        return activeTime >= c.timestamp && activeTime < nextTime;
    });

    return (
        <div className="flex flex-col h-full bg-slate-900/50">
            {/* List Header */}
            <div className="p-8 border-b border-white/5 bg-slate-950/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Activity className="text-blue-500 w-5 h-5" />
                        <h2 className="text-xl font-black tracking-tighter">Concepts</h2>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                        {concepts.length} Nodes
                    </div>
                </div>

                {/* Sub-search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="FILTER_SEMANTIC_INDEX..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-6 text-xs font-mono focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* Concept Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredConcepts.map((concept, idx) => {
                    const isActive = concept.id === (concepts[activeIndex]?.id);

                    return (
                        <motion.button
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={concept.id}
                            onClick={() => onConceptClick(concept.timestamp)}
                            className={cn(
                                "w-full text-left p-6 rounded-2xl transition-all duration-300 group relative flex items-start gap-4 border border-transparent",
                                isActive
                                    ? "bg-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-500/5"
                                    : "hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-highlight"
                                    className="absolute inset-0 bg-blue-600/5 rounded-2xl border border-blue-500/20"
                                />
                            )}

                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs transition-colors border",
                                isActive ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-white/5 text-slate-500"
                            )}>
                                {idx < 9 ? `0${idx + 1}` : idx + 1}
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={cn(
                                        "font-bold block transition-colors tracking-tight",
                                        isActive ? "text-blue-400" : "text-slate-200"
                                    )}>
                                        {concept.label}
                                    </span>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono",
                                        isActive ? "bg-blue-600 text-white" : "bg-slate-950 text-slate-500"
                                    )}>
                                        <Clock className="w-3 h-3" />
                                        {formatTime(concept.timestamp)}
                                    </div>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed line-clamp-2",
                                    isActive ? "text-slate-300" : "text-slate-500"
                                )}>
                                    {concept.definition}
                                </p>
                            </div>

                            {!isActive && (
                                <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="p-4 border-t border-white/5 bg-slate-950/20 flex items-center justify-between text-[9px] font-bold text-slate-600 tracking-widest uppercase">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    Index Synced
                </div>
                <div>v1.0.4 // STABLE</div>
            </div>
        </div>
    );
}
