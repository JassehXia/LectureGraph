"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Maximize, FastForward, Rewind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
    src: string;
    onTimeUpdate: (time: number) => void;
    seekTime?: number;
}

export default function VideoPlayer({ src, onTimeUpdate, seekTime }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (seekTime !== undefined && videoRef.current) {
            videoRef.current.currentTime = seekTime;
            videoRef.current.play();
            setIsPlaying(true);
        }
    }, [seekTime]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            setProgress((current / duration) * 100);
            onTimeUpdate(current);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && videoRef.current.duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedValue = (x / rect.width);
            videoRef.current.currentTime = clickedValue * videoRef.current.duration;
        }
    };

    return (
        <div className="relative group bg-black h-full w-full overflow-hidden flex items-center justify-center">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={handleTimeUpdate}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col gap-4 shadow-2xl">
                    {/* Progress Bar */}
                    <div
                        className="h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group/bar"
                        onClick={handleSeek}
                    >
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                            </button>

                            <div className="flex items-center gap-4 text-slate-400">
                                <RotateCcw size={16} className="cursor-pointer hover:text-white" />
                                <Rewind size={16} className="cursor-not-allowed opacity-50" />
                                <FastForward size={16} className="cursor-not-allowed opacity-50" />
                            </div>

                            <div className="flex items-center gap-3 text-slate-400">
                                <Volume2 size={16} />
                                <div className="w-20 h-1 bg-white/5 rounded-full">
                                    <div className="w-2/3 h-full bg-blue-500/50" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-slate-500 tracking-tighter uppercase">Signal_Active</span>
                            <div className="h-4 w-px bg-white/5" />
                            <Maximize size={16} className="text-slate-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Play Button Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 backdrop-blur-md flex items-center justify-center text-white border border-blue-500/30">
                        <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}
