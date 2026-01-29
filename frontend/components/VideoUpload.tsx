"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, FileVideo, CheckCircle2, AlertCircle, Loader2, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export default function VideoUpload() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
        }
    };

    const uploadVideo = async () => {
        if (!file) return;

        setUploading(true);
        setStatus("uploading");
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:8000/process", formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                },
            });

            const { id } = response.data;
            setStatus("success");

            // Short delay to show success state before redirect
            setTimeout(() => {
                router.push(`/lecture/${id}`);
            }, 1500);
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <label className={cn(
                "w-full py-16 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer group relative overflow-hidden",
                file ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800 hover:border-blue-500/30 hover:bg-slate-900/50"
            )}>
                <input type="file" className="hidden" accept="video/mp4" onChange={handleFileChange} disabled={uploading} />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-4 text-center px-10"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                <Plus className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Upload Archive</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Format: MP4 // MAX 500MB</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 text-center px-10"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <FileVideo className="text-white" />
                            </div>
                            <div className="max-w-[240px]">
                                <h3 className="text-sm font-bold text-white truncate mb-1">{file.name}</h3>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ready for analysis</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </label>

            <div className="flex flex-col gap-3">
                <button
                    onClick={uploadVideo}
                    disabled={!file || uploading || status === "success"}
                    className={cn(
                        "w-full py-5 rounded-2xl font-bold text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3",
                        !file || uploading || status === "success"
                            ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                    )}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" />
                            <span>Processing Archive...</span>
                        </>
                    ) : status === "success" ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Analysis Complete</span>
                        </>
                    ) : (
                        <>
                            <span>Construct Network</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>

                {uploading && (
                    <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {status === "error" && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                    <AlertCircle size={14} />
                    <span>Failed to process archival stream. System error.</span>
                </div>
            )}
        </div>
    );
}
