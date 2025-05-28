"use client";

import React from "react";
import { ItemType } from "../types/types";
import ListItem from "./ListItem";

interface ListContentProps {
  items: ItemType[];
  isShowingPartnerList: boolean;
  partnerUid: string | null;
  onEdit: (item: ItemType) => void;
  onConfirm: (item: ItemType) => void;
}

/**
 * リストコンテンツコンポーネント
 */
const ListContent: React.FC<ListContentProps> = ({
  items,
  isShowingPartnerList,
  partnerUid,
  onEdit,
  onConfirm,
}) => {
  return (
    <div className="flex-1 overflow-y-auto mb-16 px-4">
      {items.length === 0 ? (
        <div className="text-center mt-20 text-black">
          {isShowingPartnerList && !partnerUid
            ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
            : "リストが空です。"}
        </div>
      ) : (
        <ul className="space-y-4 w-full">
          {items.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              isShowingPartnerList={isShowingPartnerList}
              onEdit={onEdit}
              onConfirm={onConfirm}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListContent;
