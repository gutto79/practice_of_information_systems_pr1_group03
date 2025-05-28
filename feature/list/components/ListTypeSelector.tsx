"use client";

import React from "react";

interface ListTypeSelectorProps {
  listType: "like" | "sad";
  onSelectType: (type: "like" | "sad") => void;
}

/**
 * リストタイプ選択コンポーネント
 */
const ListTypeSelector: React.FC<ListTypeSelectorProps> = ({
  listType,
  onSelectType,
}) => {
  return (
    <div className="flex justify-center items-start mt-4 mb-8">
      <div className="flex flex-row gap-4">
        {[
          { key: "like", label: ["嬉しいこと", "リスト"] },
          { key: "sad", label: ["悲しいこと", "リスト"] },
        ].map((item) => (
          <button
            key={item.key}
            className={`text-3xl px-8 py-8 rounded font-semibold azuki-font min-w-[220px] min-h-[100px] ${
              // listTypeに応じて背景色と文字色を動的に変更
              listType === item.key
                ? item.key === "like"
                  ? "bg-pink-500 text-white" // 嬉しいことリストが選択されたらピンク
                  : "bg-blue-500 text-white" // 悲しいことリストが選択されたら青
                : "bg-gray-300 text-black" // 選択されていない場合はグレーと黒文字
            } azuki-font`}
            onClick={() => onSelectType(item.key as "like" | "sad")}
          >
            <div className="leading-tight">
              {item.label.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ListTypeSelector;
