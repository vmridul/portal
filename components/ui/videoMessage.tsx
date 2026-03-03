import { useState, useRef } from "react";
import { Play } from "lucide-react";

export const VideoMessage = ({
    src,
    onLoadedData,
}: {
    src: string;
    onLoadedData?: () => void;
}) => {
    const [hasPlayed, setHasPlayed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handlePlayClick = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setHasPlayed(true);
        }
    };

    return (
        <div className="relative w-full max-w-[200px] md:max-w-[500px] rounded-[8px] mb-2 overflow-hidden">
            <video
                ref={videoRef}
                src={src}
                preload="metadata"
                controls={hasPlayed}
                className="w-full h-full object-contain"
                onLoadedData={onLoadedData}
                onPlay={() => setHasPlayed(true)}
            />
            {!hasPlayed && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                    onClick={handlePlayClick}
                >
                    <div className="w-12 h-12 rounded-[20px] bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    );
};
