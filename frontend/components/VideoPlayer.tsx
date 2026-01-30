"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, Settings, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, cn } from "@/lib/utils";

interface VideoPlayerProps {
    src: string;
    onTimeUpdate: (time: number) => void;
    seekTime?: number;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer({ src, onTimeUpdate, seekTime }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        if (seekTime !== undefined && videoRef.current) {
            videoRef.current.currentTime = seekTime;
            videoRef.current.play();
            setIsPlaying(true);
        }
    }, [seekTime]);

    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            setCurrentTime(current);
            onTimeUpdate(current);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = val;
            setCurrentTime(val);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setIsMuted(val === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            videoRef.current.muted = nextMuted;
        }
    };

    const changePlaybackRate = (rate: number) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setShowSettings(false);
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!document.fullscreenElement) {
                containerRef.current.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative group bg-black w-full h-full overflow-hidden select-none flex items-center justify-center"
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={handleLoadedMetadata}
            />

            {/* UI Overlay Container (Always present, but controls fade) */}
            <div className={cn(
                "absolute inset-0 z-50 transition-opacity duration-300 pointer-events-none",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}>
                {/* Gradient Shadow Backdrop */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-6 pointer-events-auto">
                    {/* 1. Timeline Slider (Full Width) */}
                    <div className="w-full group/timeline relative flex items-center h-4">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                            title="Seek"
                        />
                        {/* Visual Progress Bar */}
                        <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full overflow-hidden group-hover/timeline:h-2 transition-all">
                            <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        {/* Knob */}
                        <div
                            className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl scale-0 group-hover/timeline:scale-100 transition-transform"
                            style={{ left: `calc(${progressPercentage}% - 8px)` }}
                        />
                    </div>

                    {/* 2. Controls Panel (Pinned Left) */}
                    <div className="flex items-center justify-start">
                        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[1.25rem] shadow-2xl">
                            <button onClick={togglePlay} className="text-white hover:text-blue-400 p-2 transition-all active:scale-95">
                                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                            </button>

                            <div className="h-6 w-px bg-white/10 mx-1" />

                            <div className="flex items-center gap-2 group/volume px-2">
                                <button onClick={toggleMute} className="text-white hover:text-blue-400">
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 ml-2"
                                    />
                                </div>
                            </div>

                            <div className="px-4 text-[11px] font-bold text-white/90 font-mono tracking-widest uppercase flex items-center gap-1.5">
                                <span className="text-blue-400">{formatTime(currentTime)}</span>
                                <span className="text-white/20">/</span>
                                <span className="text-white/40">{formatTime(duration)}</span>
                            </div>

                            <div className="h-6 w-px bg-white/10 mx-1" />

                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={cn("text-white hover:text-blue-400 p-2 transition-all duration-300", showSettings && "text-blue-400 rotate-90")}
                                >
                                    <Settings size={20} />
                                </button>

                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.9 }}
                                            className="absolute bottom-full mb-6 left-0 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl py-3 min-w-[160px] shadow-2xl"
                                        >
                                            <div className="px-5 py-2 border-b border-white/5 mb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Speed</span>
                                            </div>
                                            {PLAYBACK_SPEEDS.map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => changePlaybackRate(rate)}
                                                    className="w-full px-6 py-2.5 hover:bg-white/5 text-left text-xs flex items-center justify-between group/rate"
                                                >
                                                    <span className={cn(playbackRate === rate ? "text-blue-400 font-bold" : "text-slate-400 group-hover/rate:text-white")}>
                                                        {rate === 1 ? 'Normal' : `${rate}x`}
                                                    </span>
                                                    {playbackRate === rate && <Check size={14} className="text-blue-400" />}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 p-2 transition-colors">
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Play Action Pulse Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-30"
                    >
                        <div className="w-24 h-24 rounded-full bg-blue-600/10 backdrop-blur-xl flex items-center justify-center text-white border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                            <Play size={48} fill="currentColor" className="ml-1.5" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
