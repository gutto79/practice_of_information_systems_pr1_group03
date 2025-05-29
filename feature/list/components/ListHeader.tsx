"use client";

import React from "react";

interface ListHeaderProps {
  isShowingPartnerList: boolean;
  partnerUid: string | null;
  onTogglePartnerList: () => void;
  onAddClick: () => void;
  myName?: string;
  partnerName?: string;
}

/**
 * リストヘッダーコンポーネント
 */
const ListHeader: React.FC<ListHeaderProps> = ({
  isShowingPartnerList,
  partnerUid,
  onTogglePartnerList,
  onAddClick,
  myName = "自分",
  partnerName = "相手",
}) => {
  return (
    <header className="w-full p-4 flex justify-between items-center z-10">
      <button
        className="text-lg bg-blue-500 text-white px-2.5 py-2 rounded azuki-font hover:bg-blue-600"
        onClick={onTogglePartnerList}
        disabled={!partnerUid}
        title={
          !partnerUid
            ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
            : undefined
        }
      >
        {isShowingPartnerList
          ? `${myName}のリストへ`
          : `${partnerName}のリストへ`}
      </button>
      <div>
        {!isShowingPartnerList && (
          <button
            className="text-lg bg-purple-600 text-white px-4 py-2 rounded azuki-font hover:bg-purple-700"
            onClick={onAddClick}
            aria-label="行動を登録"
          >
            行動を登録
          </button>
        )}
      </div>
    </header>
  );
};

export default ListHeader;
