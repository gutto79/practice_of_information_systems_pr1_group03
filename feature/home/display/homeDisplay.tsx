"use client";

import React from "react";
import UserStatus from "../components/UserStatus";
import RecentActivities from "../components/RecentActivities";
import InviteForm from "../components/InviteForm";
import TimeRangeModal from "../components/TimeRangeModal";
import Toast from "../components/Toast";
import VideoPlayer from "../components/VideoPlayer";
import { styles } from "../utils/utils";
import { useHomeData } from "../hooks/useHomeData";

/**
 * ホーム画面表示コンポーネント
 */
const HomeDisplay: React.FC = () => {
  const {
    hasPartner,
    loading,
    userHappiness,
    userGender,
    userName,
    partnerHappiness,
    partnerGender,
    partnerName,
    user,
    recentActions,
    pendingInvites,
    sentInvites,
    showTimeModal,
    selectedTimeRange,
    showToast,
    toastMessage,
    showToastMessage,
    handleSendInvite,
    handleCopyId,
    handleAcceptInvite,
    handleDeclineInvite,
    handleDeleteInvite,
    handleSelectTimeRange,
    handleGenerateMovie,
    setShowTimeModal,
    handleGetMovie,
    videoUrl,
    setVideoUrl,
  } = useHomeData();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>読み込み中...</p>
      </div>
    );
  }

  // パートナーがいない場合の表示
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

  // パートナーがいる場合の表示
  return (
    <div className="relative p-6 h-screen">
      {/* 自分の幸福度（右上角） */}
      <div className="absolute top-4 right-4">
        <UserStatus
          happiness={userHappiness}
          gender={userGender}
          name={userName}
        />
      </div>

      {/* 相手の幸福度（中央） */}
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-xs">
          {/* カップル画像 */}
          <div className="flex justify-center mb-4">
            <img
              src="/feature/home/images/love_couple_good.png"
              alt="カップル"
              className="w-32 h-32 object-contain"
            />
          </div>

          {/* パートナーの幸福度 */}
          <UserStatus
            happiness={partnerHappiness}
            gender={partnerGender}
            name={partnerName}
            isPartner={true}
          />

          {/* 最近の活動 */}
          <RecentActivities actions={recentActions} />
        </div>
      </div>

      {/* 動画生成ボタン */}
      <div className="fixed bottom-20 left-4">
        <button
          onClick={() => setShowTimeModal(true)}
          className={styles.button.action}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {/* 時間範囲選択モーダル */}
      <TimeRangeModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        selectedRange={selectedTimeRange}
        onSelectRange={handleSelectTimeRange}
        onGenerate={handleGetMovie}
      />

      {/* トースト通知 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => showToastMessage("")}
      />

      {/* 動画プレーヤー */}
      {videoUrl && (
        <VideoPlayer
          videoUrl={videoUrl}
          onClose={() => setVideoUrl(null)}
        />
      )}
    </div>
  );
};

export default HomeDisplay;
