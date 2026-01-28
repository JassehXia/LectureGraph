"use client";

import { useState } from "react";
import { Upload, FileVideo, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/lib/utils";
import { saveLecture } from "@/app/actions/lecture";

export default function VideoUpload() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus("idle");
            setProgress(0);
        }
    };

    const uploadVideo = async () => {
        if (!file) return;

        setUploading(true);
        setStatus("uploading");
        setProgress(0);

        try {
            // 1. Get presigned URL
            console.log("Stage 1: Getting presigned URL...");
            const { data } = await axios.post("/api/upload", {
                filename: file.name,
                contentType: file.type,
            });

            const { url, key } = data;
            console.log("Presigned URL received:", url);

            // 2. Upload to R2 directly
            console.log("Stage 2: Uploading to R2...");
            await axios.put(url, file, {
                headers: { "Content-Type": file.type },
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    setProgress(percentCompleted);
                },
            });
            console.log("R2 upload complete.");

            // 3. Notify backend and save to DB
            console.log("Stage 3: Saving to Database...");
            const result = await saveLecture({
                title: file.name,
                r2Key: key,
            });

            if (result.success) {
                console.log("Upload and save successful!");
                setStatus("success");
                // Redirect to the new lecture page
                setTimeout(() => {
                    router.push(`/lecture/${result.videoId}`);
                }, 1500);
            } else {
                console.error("Database save failed:", result.error);
                setStatus("error");
            }
        } catch (error: any) {
            console.error("Critical upload error:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
            setStatus("error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    {status === "success" ? (
                        <CheckCircle className="w-10 h-10" />
                    ) : status === "error" ? (
                        <XCircle className="w-10 h-10 text-red-400" />
                    ) : (
                        <Upload className="w-10 h-10" />
                    )}
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Upload Lecture</h2>
                    <p className="text-slate-400 text-sm">
                        Drag and drop your MP4 files here, or click to browse
                    </p>
                </div>

                <label className="w-full relative group cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        accept="video/mp4"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <div className={cn(
                        "w-full py-12 border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center gap-4",
                        file ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}>
                        {file ? (
                            <>
                                <FileVideo className="w-8 h-8 text-blue-400" />
                                <span className="text-slate-200 font-medium">{file.name}</span>
                                <span className="text-slate-500 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </>
                        ) : (
                            <span className="text-slate-500">No file selected</span>
                        )}
                    </div>
                </label>

                {uploading && (
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    onClick={uploadVideo}
                    disabled={!file || uploading}
                    className={cn(
                        "w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2",
                        !file || uploading
                            ? "bg-white/5 text-slate-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40"
                    )}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Start Upload"
                    )}
                </button>
            </div>
        </div>
    );
}
