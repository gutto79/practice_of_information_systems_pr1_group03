"use client";

import React from "react";

// スライダーのグラデーションを計算する関数
const getSliderBackground = (value: number | null) => {
  if (value === null) {
    // デフォルトのグラデーション（例えば、中央が0で青から赤へ）
    return "linear-gradient(to right, #4169E1, #FFC0CB 50%, #FF6347)";
  }

  // 色の定義
  const blueColor = "#4169E1"; // ロイヤルブルー
  const lightBlue = "#ADD8E6"; // ライトブルー
  const middleColor = "#E0E0E0"; // グレーや非常に薄い色（0付近）
  const lightPink = "#FFC0CB"; // ライトピンク
  const redColor = "#FF6347"; // トマトレッド

  // グラデーションの停止位置を調整して、ピンク/赤を強めに侵食させる
  // 例: -100 (青) --- -20 (青から中間へ) --- 0 (中間) --- +20 (中間からピンクへ) --- +100 (ピンク/赤)
  // 0点を中心に、負の側にもピンクが少し広がるように調整
  const blueEndStop = 40; // 正規化された値で40%（元の値で-20）あたりまで青系
  const pinkStartStop = 60; // 正規化された値で60%（元の値で+20）あたりからピンク系
  // これにより、40%から60%の間（-20から+20）が中間色〜薄いグラデーションになり、
  // 0点を含めてピンクが左に少し侵食するような見え方になります。

  return `linear-gradient(to right, ${blueColor}, ${lightBlue} ${blueEndStop}%, ${middleColor} 50%, ${lightPink} ${pinkStartStop}%, ${redColor})`;
};

interface ListFormProps {
  actionName: string;
  happinessChange: number | null;
  editingItemId: number | null;
  loading: boolean;
  onActionNameChange: (name: string) => void;
  onHappinessChange: (value: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * リスト入力フォームコンポーネント
 */
const ListForm: React.FC<ListFormProps> = ({
  actionName,
  happinessChange,
  editingItemId,
  loading,
  onActionNameChange,
  onHappinessChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 text-black azuki-font">
        出来事
      </label>
      <input
        type="text"
        placeholder="名前"
        value={actionName}
        onChange={(e) => onActionNameChange(e.target.value)}
        className="border p-2 rounded w-full mb-4 text-black"
      />

      {/* ポイント表示を大きく */}
      <label className="block text-3xl font-bold mb-3 text-black">
        幸福度の変化: {happinessChange}
      </label>
      <input
        type="range" // typeをrangeに変更
        min="-100" // 最小値
        max="100" // 最大値
        step="1" // 1刻み
        value={happinessChange !== null ? happinessChange : 0} // nullの場合のデフォルト値
        onChange={(e) => onHappinessChange(Number(e.target.value))} // スライダーの値を直接 happinessChange に設定
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: getSliderBackground(happinessChange), // グラデーションを動的に適用
        }}
      />
      {/* スライダーの0点の表示 */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>-100</span>
        <span className={happinessChange === 0 ? "font-bold text-red-500" : ""}>
          0
        </span>{" "}
        {/* 0の場合強調 */}
        <span>+100</span>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500"
          type="button"
        >
          キャンセル
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
          type="button"
          disabled={loading}
        >
          {editingItemId !== null ? "保存" : "登録"}
        </button>
      </div>
    </div>
  );
};

export default ListForm;
