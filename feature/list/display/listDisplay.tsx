"use client";

import React from "react";
import { useList } from "../hooks/useList";

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

const ListDisplay: React.FC = () => {
  const {
    items,
    showForm,
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
    setShowForm,
    setIsShowingPartnerList,
    setListType,
    setConfirmingItem,
    setEditingItemId,

    startEdit,
    cancelForm,
    handleConfirmYes,
    handleSubmit,
  } = useList();

  return (
    <>
      {/* 既存のヘッダー要素から「感情リスト」テキストを削除 */}
      <header className="w-full p-4 flex justify-end items-center z-10">
        {" "}
        {/* justify-end に変更してボタンを右寄せ */}
        {/* 「感情リスト」のテキストは削除しました */}
        <button
          className="text-lg bg-blue-500 text-white px-2.5 py-2 rounded azuki-font"
          onClick={() => setIsShowingPartnerList(!isShowingPartnerList)}
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

      {/* mt-4 に変更し、ヘッダーとの間隔を短縮 */}
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
              onClick={() => setListType(item.key as "like" | "sad")}
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

      {showForm && (
        <div className="mb-6 p-4 mx-8 border rounded bg-gray-100">
          <label className="block text-sm font-semibold mb-1 text-black azuki-font">
            出来事
          </label>
          <input
            type="text"
            placeholder="名前"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-black"
          />

          {/* 感情の種類ボタンを削除しました */}

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
            onChange={(e) => setHappinessChange(Number(e.target.value))} // スライダーの値を直接 happinessChange に設定
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: getSliderBackground(happinessChange), // グラデーションを動的に適用
            }}
          />
          {/* スライダーの0点の表示 */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>-100</span>
            <span
              className={happinessChange === 0 ? "font-bold text-red-500" : ""}
            >
              0
            </span>{" "}
            {/* 0の場合強調 */}
            <span>+100</span>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            {" "}
            {/* スライダーとの間に余白を追加 */}
            <button
              onClick={cancelForm}
              className="px-6 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500"
              type="button"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
              type="button"
              disabled={loading}
            >
              {editingItemId !== null ? "保存" : "登録"}
            </button>
          </div>
        </div>
      )}

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
              <li
                key={item.id}
                className="flex justify-between items-center py-3 px-4 bg-white text-black rounded-lg shadow-sm"
              >
                {!isShowingPartnerList && (
                  <button
                    onClick={() => startEdit(item)}
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
                  className={`flex-1 ${
                    !isShowingPartnerList ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (!isShowingPartnerList) {
                      setConfirmingItem(item);
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
                  {item.originalHappinessChange < 0
                    ? `-${item.point}`
                    : item.point}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {confirmingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <p className="text-lg font-semibold mb-4 text-black">
              「{confirmingItem.name}」というイベントがありましたか？
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleConfirmYes}
              >
                はい
              </button>
              <button
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setConfirmingItem(null)}
              >
                いいえ
              </button>
            </div>
          </div>
        </div>
      )}

      {!isShowingPartnerList && !showForm && (
        <button
          onClick={() => {
            setEditingItemId(null);
            setActionName("");
            setHappinessChange(1); // 新規追加時はスライダーをデフォルト値（1）に設定
            setShowForm(true);
          }}
          className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-purple-500 text-white text-4xl flex items-center justify-center shadow-lg hover:bg-purple-600 z-50"
          aria-label="新しい出来事を追加"
        >
          ＋
        </button>
      )}
    </>
  );
};

export default ListDisplay;
