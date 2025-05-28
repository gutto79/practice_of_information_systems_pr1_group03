"use client";

import React from "react";

interface ListHeaderProps {
  isShowingPartnerList: boolean;
  partnerUid: string | null;
  onTogglePartnerList: () => void;
}

/**
 * リストヘッダーコンポーネント
 */
const ListHeader: React.FC<ListHeaderProps> = ({
  isShowingPartnerList,
  partnerUid,
  onTogglePartnerList,
}) => {
  return (
    <header className="w-full p-4 flex justify-end items-center z-10">
      <button
        className="text-lg bg-blue-500 text-white px-2.5 py-2 rounded azuki-font"
        onClick={onTogglePartnerList}
        disabled={!partnerUid}
        title={
          !partnerUid
            ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
            : undefined
        }
      >
        {isShowingPartnerList ? "自分のリストへ" : "相手のリストへ"}
      </button>
    </header>
  );
};

export default ListHeader;
