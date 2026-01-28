"use client";

import { Search, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Concept {
    id: string;
    label: string;
    definition?: string | null;
    timestamp: number;
}

interface ConceptListProps {
    concepts: Concept[];
    activeTime: number;
    onConceptClick: (timestamp: number) => void;
}

export default function ConceptList({ concepts, activeTime, onConceptClick }: ConceptListProps) {
    // Sort concepts by timestamp
    const sortedConcepts = [...concepts].sort((a, b) => a.timestamp - b.timestamp);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Knowledge Index</h3>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                        {concepts.length} Concepts
                    </span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="Search concepts..."
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-3">
                    {sortedConcepts.map((concept) => {
                        const isActive = activeTime >= concept.timestamp &&
                            activeTime < (sortedConcepts[sortedConcepts.indexOf(concept) + 1]?.timestamp || Infinity);

                        return (
                            <button
                                key={concept.id}
                                onClick={() => onConceptClick(concept.timestamp)}
                                className={cn(
                                    "w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-blue-600 shadow-lg shadow-blue-900/40"
                                        : "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10"
                                )}
                            >
                                {/* Active Indicator Glow */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent animate-pulse" />
                                )}

                                <div className="relative z-10 flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className={cn(
                                            "text-sm font-bold block transition-colors",
                                            isActive ? "text-white" : "text-slate-200"
                                        )}>
                                            {concept.label}
                                        </span>
                                        <p className={cn(
                                            "text-xs leading-relaxed line-clamp-2",
                                            isActive ? "text-blue-100" : "text-slate-400"
                                        )}>
                                            {concept.definition}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono",
                                        isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                                    )}>
                                        <Clock className="w-3 h-3" />
                                        {formatTime(concept.timestamp)}
                                    </div>
                                </div>

                                {/* Right Arrow */}
                                {!isActive && (
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
