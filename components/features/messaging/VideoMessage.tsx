import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { Skeleton } from "@/components/shared/skeletons/Skeleton";

export const VideoMessage = ({
    src,
    onLoadedData,
    onPreview,
}: {
    src: string;
    onLoadedData?: () => void;
    onPreview?: () => void;
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleLoadedData = () => {
        setIsLoading(false);
        onLoadedData?.();
    };

    return (
        <div
            className="relative w-full max-w-[200px] md:max-w-[500px] rounded-[8px] mb-2 overflow-hidden cursor-pointer group/video bg-theme-surface min-h-[150px]"
            onClick={onPreview}
        >
            {isLoading && (
                <Skeleton className="absolute inset-0 z-20" />
            )}

            <video
                ref={videoRef}
                src={src}
                preload="metadata"
                className={`w-full h-auto block transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                onLoadedData={handleLoadedData}
            />

            {!isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-[16px] bg-theme-border flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
    );
};
