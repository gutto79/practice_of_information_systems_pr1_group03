/**
 * ホーム機能に関連する型定義
 */
import type { Couple } from "@/types";

// アプリケーション内で使用するユーザー情報の型
// DBの型とは少し異なる（idフィールドなど）
export interface User {
  id: string;
  name?: string | null;
  happiness?: number | null;
  gender?: string | null;
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

// グローバル型定義を再エクスポート
export type { Couple };

// ホーム画面の状態の型
export interface HomeState {
  hasPartner: boolean;
  inviteId: string;
  userHappiness: number | null;
  partnerHappiness: number | null;
  loading: boolean;
  partnerId: string | null;
  userGender: string | null;
  partnerGender: string | null;
  pendingInvites: Invite[];
  sentInvites: Invite[];
  user: User | null;
  userName: string | null;
  partnerName: string | null;
  recentActions: RecentAction[];
  showTimeModal: boolean;
  selectedTimeRange: TimeRange;
  showBreakupModal: boolean;
  showToast: boolean;
  toastMessage: string;
}
