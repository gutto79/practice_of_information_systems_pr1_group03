"use client";

import React from "react";
import { PopUp } from "@/components/display/Popup";
import VideoPlayer from "./VideoPlayer";
import { useMovieContext } from "@/hooks/useMovieContext";

/**
 * ビデオモーダルコンポーネント
 * グローバルに使用できるビデオプレーヤーモーダル
 */
const VideoModal: React.FC = () => {
  const { videoUrl, videoPlayerModal } = useMovieContext();

  // モーダルを閉じる際の処理
  const handleClose = () => {
    videoPlayerModal.closeModal();
    // 動画URLはクリアせず、グローバルステートに保持し続ける
  };

  return (
    <PopUp isOpen={videoPlayerModal.isOpen} onClose={handleClose}>
      <div className="p-6">
        {videoUrl ? (
          <VideoPlayer videoUrl={videoUrl} />
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-600 mb-4">
              スライドショーがありません。生成しましょう！
            </div>
          </div>
        )}
      </div>
    </PopUp>
  );
};

export default VideoModal;
