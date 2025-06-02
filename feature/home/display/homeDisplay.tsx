"use client";

import React, { useEffect } from "react";
import UserStatus from "../components/UserStatus";
import RecentActivities from "../components/RecentActivities";
import InviteForm from "../components/InviteForm";
import TimeRangeModal from "../components/TimeRangeModal";
import Toast from "../components/Toast";
import VideoModal from "../components/VideoModal";
import { PopUp } from "@/components/display/Popup";
import { useHomeData } from "../hooks/useHomeData";
import { useMovie } from "../hooks/useMovie";
import { useModal } from "@/hooks/useModal";
import { useMovieContext } from "@/hooks/useMovieContext";
import CenteredLoadingSpinner from "@/components/ui/centered-loading-spinner";

/**
 * ホーム画面表示コンポーネント
 */
const HomeDisplay: React.FC = () => {
  // モーダル状態管理
  const timeRangeModal = useModal();
  const { videoPlayerModal, videoUrl } = useMovieContext();

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
    handleGenerateMovie,
    handleGetMovie,
    status,
    loading: movieLoading,
    clearError,
  } = useMovie();

  // コンポーネントマウント時に動画を取得
  useEffect(() => {
    if (hasPartner) {
      handleGetMovie();
    }
  }, [hasPartner]);

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
          <RecentActivities 
            actions={recentActions} 
            name={userName}
          />
        </div>
      </div>

      {/* スライドショー生成ボタン */}
      <div className="fixed top-20 left-4 flex flex-col gap-2">
        <button
          onClick={timeRangeModal.openModal}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors text-white shadow-lg"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-sm font-medium">スライドショー生成</span>
        </button>

        {/* 動画生成状態表示 または 動画表示ボタン */}
        {status?.status === "processing" ? (
          <div className="px-3 py-2 rounded-lg shadow-lg bg-yellow-100 text-yellow-800">
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-3 w-3 border-2 border-yellow-800 border-t-transparent rounded-full"></div>
              <span className="text-sm">生成中...</span>
            </div>
          </div>
        ) : status?.status === "failed" ? (
          <div className="px-3 py-2 rounded-lg shadow-lg bg-red-100 text-red-800">
            <div className="flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">エラーが発生しました</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearError();
                }}
                className="ml-2 text-xs underline hover:no-underline"
              >
                閉じる
              </button>
            </div>
          </div>
        ) : videoUrl || status?.status === "completed" ? (
          <div
            className="px-3 py-2 rounded-lg shadow-lg bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
            onClick={videoPlayerModal.openModal}
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-sm">スライドショー表示</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* 時間範囲選択モーダル */}
      <PopUp isOpen={timeRangeModal.isOpen} onClose={timeRangeModal.closeModal}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">スライドショー生成</h3>
          <TimeRangeModal
            selectedRange={selectedTimeRange}
            onSelectRange={handleSelectTimeRange}
            onGenerate={async () => {
              timeRangeModal.closeModal();
              await handleGenerateMovie();
            }}
            disabled={movieLoading}
          />
        </div>
      </PopUp>

      {/* グローバルな動画プレーヤーモーダル */}
      <VideoModal />
    </div>
  );
};

export default HomeDisplay;
