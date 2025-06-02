/**
 * ホーム機能に関連する型定義
 */
import { Couple, AppUser, Invite, RecentAction, TimeRange } from "@/types";

// グローバル型定義を再エクスポート
export type { Couple, AppUser as User, Invite, RecentAction, TimeRange };

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
  user: AppUser | null;
  userName: string | null;
  partnerName: string | null;
  recentActions: RecentAction[];
  showBreakupModal: boolean;
  showToast: boolean;
  toastMessage: string;
}
