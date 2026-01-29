"use client";

import VideoUpload from "@/components/VideoUpload";
import { Sparkles, Zap, Share2, BrainCircuit, Github, MonitorPlay, Network } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-100 selection:bg-blue-500/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] animate-glow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Navbar */}
        <nav className="flex items-center justify-between mb-32">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              LectureGraph
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
            <a href="https://github.com" className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all">
              <Github size={16} />
              <span>Star on GitHub</span>
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Next-Gen Audio Intelligence</span>
            </div>

            <h1 className="text-7xl font-black tracking-tight leading-[0.9] text-white">
              Map your <span className="text-blue-500 neon-text">Knowledge</span> <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                In Real-Time.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Convert complex lectures into interactive semantic networks.
              Our AI nodes extract core concepts, definitions, and relationships
              so you can navigate knowledge spatially.
            </p>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <MonitorPlay className="text-blue-400 w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Video-to-Graph</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pipeline Active</div>
                </div>
              </div>
              <div className="w-[1px] h-10 bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <Network className="text-purple-400 w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Semantic Nodes</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network Live</div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-25" />
            <div className="relative p-1 glass-panel rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/50 flex items-center px-6 border-b border-white/5 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                <span className="ml-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                  Lecture Intelligence v1.0
                </span>
              </div>
              <div className="pt-20 pb-12 px-8">
                <VideoUpload />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Stat */}
        <div className="flex justify-center mt-32">
          <div className="flex items-center gap-8 px-8 py-4 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">100k+</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Concepts Mapped</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">500ms</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Processing</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">99%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy Node</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
