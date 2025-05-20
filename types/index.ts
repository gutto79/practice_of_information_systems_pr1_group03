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
