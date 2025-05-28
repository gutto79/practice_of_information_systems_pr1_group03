"use client";

import React from "react";
import { useList } from "../hooks/useList";
import ListHeader from "../components/ListHeader";
import ListTypeSelector from "../components/ListTypeSelector";
import ListForm from "../components/ListForm";
import ListContent from "../components/ListContent";
import AddButton from "../components/AddButton";
import { PopUp } from "@/components/display/Popup";
import { useModal } from "@/hooks/useModal";
import { ItemType } from "../types/types";

/**
 * リスト表示コンポーネント
 */
const ListDisplay: React.FC = () => {
  // モーダル用のフック
  const confirmModal = useModal();
  const formModal = useModal();

  const {
    items,
    actionName,
    happinessChange,
    isShowingPartnerList,
    partnerUid,
    listType,
    loading,
    editingItemId,
    confirmingItem,

    setActionName,
    setHappinessChange,
    setIsShowingPartnerList,
    setListType,
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
    await handleConfirmYes();
    confirmModal.closeModal();
  };

  return (
    <>
      <ListHeader
        isShowingPartnerList={isShowingPartnerList}
        partnerUid={partnerUid}
        onTogglePartnerList={() =>
          setIsShowingPartnerList(!isShowingPartnerList)
        }
      />

      <ListTypeSelector listType={listType} onSelectType={setListType} />

      <ListContent
        items={items}
        isShowingPartnerList={isShowingPartnerList}
        partnerUid={partnerUid}
        onEdit={handleEditClick}
        onConfirm={handleConfirmItem}
      />

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
              `「${confirmingItem.name}」というイベントがありましたか？`}
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

      <AddButton
        isShowingPartnerList={isShowingPartnerList}
        onClick={handleAddButtonClick}
      />
    </>
  );
};

export default ListDisplay;
