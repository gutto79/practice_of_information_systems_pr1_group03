"use client";

import React, { useState } from "react";
import { useList } from "../hooks/useList";
import ListHeader from "../components/ListHeader";
import ListTypeSelector from "../components/ListTypeSelector";
import ListForm from "../components/ListForm";
import ListContent from "../components/ListContent";
import Toast from "@/components/display/Toast";
import { PopUp } from "@/components/display/Popup";
import { useModal } from "@/hooks/useModal";
import { ItemType } from "../types/types";
import HappinessChangeModal from "../components/HappinessChangeModal";
import CenteredLoadingSpinner from "@/components/ui/centered-loading-spinner";

/**
 * リスト表示コンポーネント
 */
const ListDisplay: React.FC = () => {
  // モーダル用のフック
  const confirmModal = useModal();
  const formModal = useModal();
  const happinessModal = useModal();

  // 幸福度変化の結果
  const [happinessResult, setHappinessResult] = useState<{
    itemName: string;
    happinessChange: number;
    newHappiness: number;
  } | null>(null);

  // トースト通知の状態
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // トースト表示関数
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const {
    items,
    actionName,
    happinessChange,
    isShowingPartnerList,
    partnerUid,
    listType,
    loading,
    dataLoading,
    editingItemId,
    confirmingItem,
    partnerName,
    myName,

    setActionName,
    setHappinessChange,
    setIsShowingPartnerList: originalSetIsShowingPartnerList,
    setListType: originalSetListType,
    setConfirmingItem,
    setEditingItemId,

    startEdit,
    handleConfirmYes,
    handleSubmit,
  } = useList();

  // 新規アイテム追加ボタンのクリックハンドラ
  const handleAddButtonClick = () => {
    setEditingItemId(null);
    setActionName("");
    setHappinessChange(1); // 新規追加時はスライダーをデフォルト値（1）に設定
    formModal.openModal();
  };

  // 編集ボタンクリックハンドラ
  const handleEditClick = (item: ItemType) => {
    startEdit(item);
    formModal.openModal();
  };

  // フォームキャンセル処理
  const handleCancelForm = () => {
    setEditingItemId(null);
    formModal.closeModal();
  };

  // フォーム送信処理
  const handleFormSubmit = async () => {
    await handleSubmit();
    formModal.closeModal();

    // 登録完了メッセージを表示
    if (editingItemId === null) {
      showToastMessage(
        `登録しました！「${partnerName}」が「${actionName}」をしたらリストからタップしましょう！`
      );
    }
  };

  // アイテム確認時の処理
  const handleConfirmItem = (item: ItemType) => {
    setConfirmingItem(item);
    confirmModal.openModal();
  };

  // 確認モーダルのキャンセル処理
  const handleCancelConfirm = () => {
    setConfirmingItem(null);
    confirmModal.closeModal();
  };

  // 確認モーダルの確定処理
  const handleConfirmAction = async () => {
    const result = await handleConfirmYes();
    confirmModal.closeModal();

    // 幸福度の変化を表示
    if (result) {
      setHappinessResult(result);
      happinessModal.openModal();
    }
  };

  // 幸福度変化モーダルを閉じる
  const handleCloseHappinessModal = () => {
    setHappinessResult(null);
    happinessModal.closeModal();
  };

  // リストタイプやパートナーリスト表示の切り替え時に、明示的にローディング状態を設定
  const setIsShowingPartnerList = (show: boolean) => {
    // 現在の表示状態と異なる場合のみ更新
    if (show !== isShowingPartnerList) {
      // 一度コンポーネントをアンマウントするために、dataLoadingを使わずに独自のローディング状態を使用
      setShowLoading(true);
      setTimeout(() => {
        originalSetIsShowingPartnerList(show);
        // 少し遅延させてからローディング状態を解除（UIの更新を確実にするため）
        setTimeout(() => {
          setShowLoading(false);
        }, 500);
      }, 0);
    }
  };

  const setListType = (type: "like" | "sad") => {
    // 現在のリストタイプと異なる場合のみ更新
    if (type !== listType) {
      // 一度コンポーネントをアンマウントするために、dataLoadingを使わずに独自のローディング状態を使用
      setShowLoading(true);
      setTimeout(() => {
        originalSetListType(type);
        // 少し遅延させてからローディング状態を解除（UIの更新を確実にするため）
        setTimeout(() => {
          setShowLoading(false);
        }, 500);
      }, 0);
    }
  };

  // 独自のローディング状態
  const [showLoading, setShowLoading] = useState(false);

  // 初回レンダリング時のローディング状態
  const [initialLoading, setInitialLoading] = useState(true);

  // すべてのデータが読み込まれたかどうかを確認
  const allDataLoaded =
    !dataLoading && myName !== "あなた" && partnerName !== "パートナー";

  // すべてのデータが読み込まれたらinitialLoadingをfalseに設定
  React.useEffect(() => {
    if (allDataLoaded && initialLoading) {
      // すべてのデータが読み込まれたらinitialLoadingをfalseに設定
      setInitialLoading(false);
    }
  }, [allDataLoaded, initialLoading]);

  // データ読み込み中、ローディング表示中、または初回レンダリング時はローディングスピナーのみ表示
  if (dataLoading || showLoading || initialLoading) {
    return <CenteredLoadingSpinner />;
  }

  // リストが空の場合は空のリストを表示しない
  const showEmptyList = !dataLoading && items.length === 0;

  return (
    <div className="relative">
      <ListHeader
        isShowingPartnerList={isShowingPartnerList}
        partnerUid={partnerUid}
        onTogglePartnerList={() =>
          setIsShowingPartnerList(!isShowingPartnerList)
        }
        onAddClick={handleAddButtonClick}
        myName={myName}
        partnerName={partnerName}
      />

      {/* トースト通知 */}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        duration={5000}
      />

      <ListTypeSelector listType={listType} onSelectType={setListType} />

      {!showEmptyList && (
        <ListContent
          items={items}
          isShowingPartnerList={isShowingPartnerList}
          partnerUid={partnerUid}
          onEdit={handleEditClick}
          onConfirm={handleConfirmItem}
        />
      )}

      {/* 入力フォームモーダル */}
      <PopUp isOpen={formModal.isOpen} onClose={handleCancelForm}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingItemId !== null ? "出来事を編集" : "新しい出来事を追加"}
          </h3>
          <ListForm
            actionName={actionName}
            happinessChange={happinessChange}
            editingItemId={editingItemId}
            loading={loading}
            onActionNameChange={setActionName}
            onHappinessChange={setHappinessChange}
            onCancel={handleCancelForm}
            onSubmit={handleFormSubmit}
          />
        </div>
      </PopUp>

      {/* 確認モーダル */}
      <PopUp isOpen={confirmModal.isOpen} onClose={handleCancelConfirm}>
        <div className="p-6 text-center">
          <p className="text-lg font-semibold mb-4 text-black">
            {confirmingItem &&
              `「${partnerName}」が「${confirmingItem.name}」をしましたか？`}
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={handleConfirmAction}
            >
              はい
            </button>
            <button
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={handleCancelConfirm}
            >
              いいえ
            </button>
          </div>
        </div>
      </PopUp>

      {/* 幸福度変化モーダル */}
      <PopUp isOpen={happinessModal.isOpen} onClose={handleCloseHappinessModal}>
        {happinessResult && (
          <HappinessChangeModal
            itemName={happinessResult.itemName}
            happinessChange={happinessResult.happinessChange}
            newHappiness={happinessResult.newHappiness}
            userName={myName}
            partnerName={partnerName}
            onClose={handleCloseHappinessModal}
          />
        )}
      </PopUp>
    </div>
  );
};

export default ListDisplay;
