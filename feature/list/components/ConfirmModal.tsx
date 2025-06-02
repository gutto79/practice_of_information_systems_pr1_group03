"use client";

import React from "react";
import { ItemType } from "../types/types";

interface ConfirmModalProps {
  item: ItemType | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * アクション確認モーダルコンポーネント
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  item,
  onConfirm,
  onCancel,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
        <p className="text-lg font-semibold mb-4 text-black">
          「{item.name}」というイベントがありましたか？
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={onConfirm}
          >
            はい
          </button>
          <button
            className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={onCancel}
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
