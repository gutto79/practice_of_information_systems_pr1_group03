import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string | null;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
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
    console.error('Video error:', e);
    setError('動画の読み込みに失敗しました');
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'monthly_review.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 处理背景点击
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 确保点击的是背景而不是内容区域
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-4 w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
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

        {/* 下载按钮 */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            動画をダウンロード
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 