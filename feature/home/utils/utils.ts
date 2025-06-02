/**
 * ホーム機能に関連するユーティリティ関数
 */

/**
 * 性別に基づいて背景色を取得する
 * @param gender 性別
 * @param type 色のタイプ（背景またはグラデーション）
 * @returns CSSクラス名
 */
export const getBarColor = (gender: string | null, type: "bg" | "gradient") => {
  if (!gender)
    return type === "gradient"
      ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500"
      : "bg-gray-300";

  if (gender === "女" || gender.toLowerCase() === "female") {
    return type === "gradient"
      ? "bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"
      : "bg-pink-100";
  }

  if (gender === "男" || gender.toLowerCase() === "male") {
    return type === "gradient"
      ? "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"
      : "bg-blue-100";
  }

  return type === "gradient"
    ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500"
    : "bg-gray-300";
};

/**
 * 性別に基づいて境界線の色を取得する
 * @param gender 性別
 * @returns CSSクラス名
 */
export const getBorderColor = (gender: string | null) => {
  if (!gender) return "border-gray-300";

  if (gender === "女" || gender.toLowerCase() === "female")
    return "border-pink-300";

  if (gender === "男" || gender.toLowerCase() === "male")
    return "border-blue-300";

  return "border-gray-300";
};

/**
 * 時間を相対的な表示に変換する
 * @param timestamp タイムスタンプ
 * @returns 相対的な時間表示
 */
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // 检查时间戳是否有效
  if (isNaN(date.getTime())) {
    return "無効な時間";
  }

  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60));
  const diffMinutes = Math.floor(Math.abs(diffTime) / (1000 * 60));

  // 未来时间
  if (diffTime > 0) {
    if (diffDays > 0) {
      return diffDays === 1 ? "明日" : `${diffDays}日後`;
    } else if (diffHours > 0) {
      return `${diffHours}時間後`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分後`;
    } else {
      return "まもなく";
    }
  }
  // 过去时间
  else if (diffTime < 0) {
    if (diffDays > 0) {
      return diffDays === 1 ? "昨日" : `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return "たった今";
    }
  }
  // 现在
  else {
    return "たった今";
  }
};

/**
 * トースト表示用のスタイル
 */
export const toastStyles = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: scale(0.9); }
  15% { opacity: 1; transform: scale(1); }
  85% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
}

.animate-fade-in-out {
  animation: fadeInOut 2s ease-in-out forwards;
}
`;

/**
 * 共通のスタイル定義
 */
export const styles = {
  container:
    "flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4",
  loadingContainer: "flex items-center justify-center h-screen",
  button: {
    primary:
      "bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded",
    secondary:
      "bg-gray-300 hover:bg-gray-400 text-gray-700 rounded whitespace-nowrap px-3 py-1",
    danger:
      "bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg text-sm",
    action:
      "bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center w-14 h-14 transition-transform hover:scale-105",
  },
  input:
    "border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-xs bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-400",
  toast:
    "fixed inset-0 flex items-center justify-center z-50 pointer-events-none",
  toastContent:
    "bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in-out",
  modal:
    "fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50",
  modalContent:
    "bg-white/90 backdrop-blur-md rounded-lg p-6 w-80 shadow-xl border border-white/20",
  modalTitle: "text-lg font-medium text-gray-900",
  modalCloseButton: "text-gray-400 hover:text-gray-500 transition-colors",
};
