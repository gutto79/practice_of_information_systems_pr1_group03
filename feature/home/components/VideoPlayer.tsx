import React, { useState, useEffect } from "react";

interface VideoPlayerProps {
  videoUrl: string | null;
}

/**
 * 動画プレーヤーコンポーネント
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrl) {
      setIsLoading(true);
      setError(null);
    }
  }, [videoUrl]);

  if (!videoUrl) return null;

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e);
    setError("動画の読み込みに失敗しました");
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-gray-600">動画を読み込み中...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <video
        src={videoUrl}
        controls
        className="w-full rounded-lg"
        autoPlay
        playsInline
        onError={handleError}
        onLoadedData={handleLoadedData}
      />
    </div>
  );
};

export default VideoPlayer;
