"use client";

import React from "react";
import { ItemType } from "../types/types";

interface ListItemProps {
  item: ItemType;
  isShowingPartnerList: boolean;
  onEdit: (item: ItemType) => void;
  onConfirm: (item: ItemType) => void;
}

/**
 * リストアイテムを表示するコンポーネント
 */
const ListItem: React.FC<ListItemProps> = ({
  item,
  isShowingPartnerList,
  onEdit,
  onConfirm,
}) => {
  return (
    <li className="flex justify-between items-center py-3 px-4 bg-white text-black rounded-lg shadow-sm">
      {!isShowingPartnerList && (
        <button
          onClick={() => onEdit(item)}
          className="mr-3 text-black hover:text-gray-700"
          aria-label={`編集: ${item.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536M16.5 3.75a2.25 2.25 0 113.182 3.182L7.5 19.5H4.5v-3l12-12z"
            />
          </svg>
        </button>
      )}

      <div
        className={`flex-1 ${!isShowingPartnerList ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!isShowingPartnerList) {
            onConfirm(item);
          }
        }}
      >
        <span className="text-2xl azuki-font">{item.name}</span>
      </div>

      <span
        className={`font-bold text-4xl ${
          item.type === "like"
            ? "text-pink-500 text-outline-white"
            : "text-blue-600 text-outline-white"
        }`}
      >
        {item.originalHappinessChange < 0 ? `-${item.point}` : item.point}
      </span>
    </li>
  );
};

export default ListItem;
