"use client";

import React from "react";

interface AddButtonProps {
  isShowingPartnerList: boolean;
  onClick: () => void;
}

/**
 * 追加ボタンコンポーネント
 */
const AddButton: React.FC<AddButtonProps> = ({
  isShowingPartnerList,
  onClick,
}) => {
  if (isShowingPartnerList) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-purple-500 text-white text-4xl flex items-center justify-center shadow-lg hover:bg-purple-600 z-50"
      aria-label="新しい出来事を追加"
    >
      ＋
    </button>
  );
};

export default AddButton;
