// iPhoneの画面サイズ定義
export const IPHONE_SIZES = {
  // 最新モデル
  "15_PRO_MAX": { width: 430, height: 932 }, // iPhone 15 Pro Max
  "15_PRO": { width: 393, height: 852 }, // iPhone 15 Pro
  "15_PLUS": { width: 430, height: 932 }, // iPhone 15 Plus
  "15": { width: 390, height: 844 }, // iPhone 15

  // 前世代モデル
  "14_PRO_MAX": { width: 430, height: 932 }, // iPhone 14 Pro Max
  "14_PRO": { width: 393, height: 852 }, // iPhone 14 Pro
  "14_PLUS": { width: 430, height: 932 }, // iPhone 14 Plus
  "14": { width: 390, height: 844 }, // iPhone 14

  // その他の現行モデル
  "13_MINI": { width: 375, height: 812 }, // iPhone 13 mini
  "13": { width: 390, height: 844 }, // iPhone 13
  "13_PRO": { width: 390, height: 844 }, // iPhone 13 Pro
  "13_PRO_MAX": { width: 428, height: 926 }, // iPhone 13 Pro Max

  // レガシーモデル（互換性のため）
  SE: { width: 320, height: 568 }, // iPhone 5/SE
  SE2: { width: 375, height: 667 }, // iPhone 6/7/8/SE2
  X: { width: 375, height: 812 }, // iPhone X/XS/11 Pro
  XR: { width: 414, height: 896 }, // iPhone XR/11
  XS_MAX: { width: 414, height: 896 }, // iPhone XS Max/11 Pro Max
} as const;

// 安全なエリアのパディングを計算する関数
export const getSafeAreaPadding = () => {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

// コンテナの最大幅を設定する関数
export const getContainerMaxWidth = () => {
  return {
    maxWidth: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
  };
};

// フッターの高さを設定する関数
export const getFooterHeight = () => {
  return {
    height: "calc(4rem + env(safe-area-inset-bottom))",
    paddingBottom: "env(safe-area-inset-bottom)",
  };
};

// タッチターゲットの最小サイズを設定する関数
export const getTouchTargetSize = (minSize: number = 44) => {
  return {
    minWidth: `${minSize}px`,
    minHeight: `${minSize}px`,
    padding: `${Math.max(0, (minSize - 24) / 2)}px`,
  };
};
