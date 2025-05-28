"use client";

import React from "react";
import UserStatus from "../components/UserStatus";
import RecentActivities from "../components/RecentActivities";
import InviteForm from "../components/InviteForm";
import TimeRangeModal from "../components/TimeRangeModal";
import Toast from "../components/Toast";
import VideoPlayer from "../components/VideoPlayer";
import { PopUp } from "@/components/display/Popup";
import { useHomeData } from "../hooks/useHomeData";
import { useMovie } from "../hooks/useMovie";
import { useModal } from "@/hooks/useModal";
import CenteredLoadingSpinner from "@/components/ui/centered-loading-spinner";

/**
 * ホーム画面表示コンポーネント
 */
const HomeDisplay: React.FC = () => {
  // モーダル状態管理
  const timeRangeModal = useModal();
  const videoPlayerModal = useModal();

  const {
    hasPartner,
    userHappiness,
    userName,
    partnerHappiness,
    partnerName,
    user,
    recentActions,
    pendingInvites,
    sentInvites,
    loading,

    showToast,
    toastMessage,
    showToastMessage,
    handleSendInvite,
    handleCopyId,
    handleAcceptInvite,
    handleDeclineInvite,
    handleDeleteInvite,
  } = useHomeData();

  const {
    selectedTimeRange,
    handleSelectTimeRange,
    // 本番用　handleGenerateMovie,
    handleGetMovie,
    videoUrl,
    setVideoUrl,
    status,
    loading: movieLoading,
    clearError,
  } = useMovie();

  // 動画プレーヤーを閉じる
  const handleCloseVideoPlayer = () => {
    setVideoUrl(null);
    clearError();
    videoPlayerModal.closeModal();
  };

  // 動画URLが設定されたらモーダルを開く
  React.useEffect(() => {
    if (videoUrl) {
      videoPlayerModal.openModal();
    }
  }, [videoUrl]);

  // データ読み込み中またはユーザー情報がない場合はローディング表示
  if (loading || user === null) {
    return <CenteredLoadingSpinner />;
  }

  // パートナーがいない場合は招待フォームを表示
  if (!hasPartner) {
    return (
      <>
        <InviteForm
          userId={user?.id}
          onSendInvite={handleSendInvite}
          onCopyId={handleCopyId}
          pendingInvites={pendingInvites}
          sentInvites={sentInvites}
          onAcceptInvite={handleAcceptInvite}
          onDeclineInvite={handleDeclineInvite}
          onDeleteInvite={handleDeleteInvite}
        />
        <Toast
          message={toastMessage}
          isVisible={showToast}
          onHide={() => showToastMessage("")}
        />
      </>
    );
  }

  return (
    <div className="relative p-6 h-screen">
      <div className="absolute top-4 right-4">
        <UserStatus happiness={userHappiness} name={userName} />
      </div>

      {/* 相手の幸福度（中央） */}
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-xs">
          {/* パートナーの幸福度 */}
          <UserStatus
            happiness={partnerHappiness}
            name={partnerName}
            isPartner={true}
          />

          {/* 最近の活動 */}
          <RecentActivities actions={recentActions} />
        </div>
      </div>

      {/* スライドショー生成ボタン */}
      <div className="fixed top-20 left-4">
        <button
          onClick={timeRangeModal.openModal}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors text-white shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-sm font-medium">スライドショーを生成</span>
        </button>
      </div>

      {/* 動画生成の進捗状況 */}
      {status && (
        <div
          className={`fixed bottom-32 left-4 p-4 rounded-lg shadow-lg ${
            status.status === "failed"
              ? "bg-red-100 text-red-700"
              : status.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <div className="flex items-center">
            {status.status === "processing" && (
              <div className="animate-spin mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            )}
            <p>{status.message}</p>
            {status.status === "failed" && (
              <button
                onClick={clearError}
                className="ml-2 text-sm underline hover:no-underline"
              >
                閉じる
              </button>
            )}
          </div>
        </div>
      )}

      {/* 時間範囲選択モーダル */}
      <PopUp isOpen={timeRangeModal.isOpen} onClose={timeRangeModal.closeModal}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">スライドショー生成</h3>
          <TimeRangeModal
            selectedRange={selectedTimeRange}
            onSelectRange={handleSelectTimeRange}
            onGenerate={handleGetMovie}
            disabled={movieLoading}
          />
        </div>
      </PopUp>

      {/* トースト通知 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => showToastMessage("")}
      />

      {/* 動画プレーヤー */}
      <PopUp isOpen={videoPlayerModal.isOpen} onClose={handleCloseVideoPlayer}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">スライドショー</h3>
          {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
        </div>
      </PopUp>
    </div>
  );
};

export default HomeDisplay;
