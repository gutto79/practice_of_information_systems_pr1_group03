/**
 * データベーススキーマに基づく型定義
 */

/**
 * ユーザー情報
 */
export interface User {
  uid: string; // UUID
  name: string;
  gender: string;
  happiness: number;
}

/**
 * アプリケーション内で使用するユーザー情報の型
 * DBの型とは少し異なる（idフィールドなど）
 */
export interface AppUser {
  id: string;
  name?: string | null;
  happiness?: number | null;
  gender?: string | null;
}

/**
 * カップル関係
 */
export interface Couple {
  couple_id: number;
  uid1: string; // UUID
  uid2: string; // UUID
}

/**
 * アクション情報
 */
export interface Action {
  aid: number;
  uid: string; // UUID
  action_name: string;
  happiness_change: number;
}

/**
 * アクションアイテムの型定義（リスト表示用）
 */
export type ActionItem = {
  aid: number;
  action_name: string;
  happiness_change: number;
  uid: string;
};

/**
 * 表示用アイテムの型定義
 */
export type ItemType = {
  id: number;
  name: string;
  point: number; // このpointは常に正の値なので、表示用として残す
  type: "like" | "sad";
  category: string;
  originalHappinessChange: number; // 元の符号付きポイント保持用
};

/**
 * カレンダー情報
 */
export interface Calendar {
  aid: number;
  timestamp: string; // ISO形式の日時文字列
}

/**
 * いいね情報
 */
export interface Like {
  uid: string; // UUID
  aid: number;
  timestamp: string; // ISO形式の日時文字列
}

/**
 * 招待情報
 */
export interface Invite {
  id: number;
  from_uid: string; // UUID
  to_uid: string; // UUID
  status: "pending" | "accepted" | "declined";
  created_at: string; // ISO形式の日時文字列
  from_user?: {
    uid: string;
    name: string | null;
  };
  to_user?: {
    uid: string;
    name: string | null;
  };
}

/**
 * 最近のアクション情報（表示用）
 */
export interface RecentAction {
  action_name: string;
  timestamp: string;
  happiness_change: number;
}

/**
 * 時間範囲の型
 */
export type TimeRange = "1日" | "1週間" | "1ヶ月";

/**
 * フィルタータイプの型定義
 */
export type FilterType = "" | "positive" | "negative";

/**
 * ソート順の型定義
 */
export type SortOrder = "asc" | "desc";

/**
 * 検索結果アイテムの型定義
 */
export interface SearchItem {
  id: number;
  label: string;
  weight: number;
  like_count: number;
  liked: boolean;
  isHappy: boolean;
}
