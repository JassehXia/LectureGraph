"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, Maximize } from "lucide-react";

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
            const newTime = clickedValue * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setProgress(clickedValue * 100);
        }
    };

    return (
        <div className="relative group rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-white/10">
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={handleTimeUpdate}
                onError={(e) => {
                    const video = e.currentTarget;
                    console.error("VIDEO PLAYER ERROR:", {
                        code: video.error?.code,
                        message: video.error?.message,
                        src: src
                    });
                }}
            />

            {/* Custom Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                {/* Progress Bar Container (to make it easier to click) */}
                <div
                    className="w-full h-4 -mb-2 flex items-center cursor-pointer group/progress"
                    onClick={handleSeek}
                >
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden group-hover/progress:h-2 transition-all">
                        <div
                            className="h-full bg-blue-500 transition-all duration-100 pointer-events-none"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        <button className="text-white/70 hover:text-white transition-colors">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-white/70" />
                            <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="w-3/4 h-full bg-white/60" />
                            </div>
                        </div>
                    </div>

                    <button className="text-white/70 hover:text-white">
                        <Maximize className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
