import VideoUpload from "@/components/VideoUpload";
import { Sparkles, Zap, Share2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30">
      {/* Grid Background Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1d4ed820,transparent)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Learning Experience</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            Unfold Your Lectures. <br />
            <span className="text-blue-500">Master the Graph.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed font-light">
            LectureGraph transforms linear video into a navigable 2D knowledge web.
            Teleport to exact moments, discover relationships, and learn faster.
          </p>
        </div>

        {/* Action Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h3 className="text-3xl font-semibold">Get Started</h3>

            <div className="space-y-6">
              {[
                { icon: Zap, title: "Multimodal Extraction", desc: "Whisper AI captures every word with millisecond precision." },
                { icon: Share2, title: "Semantic Mapping", desc: "Our LLM builds a map of concepts and their dependencies." },
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Decorative blob behind upload */}
            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50" />
            <VideoUpload />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          Built for the future of STEM learning. LectureGraph © 2026.
        </div>
      </footer>
    </main>
  );
}
