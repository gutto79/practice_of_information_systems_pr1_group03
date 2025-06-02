/**
 * 検索機能に関連する型定義
 */
import { FilterType, SortOrder, SearchItem } from "@/types";

/**
 * 検索プロパティの型定義
 */
export interface SearchProps {
  initialQuery: string;
  initialType: FilterType;
}

// 型を再エクスポート
export type { FilterType, SortOrder };
export type Item = SearchItem; // 互換性のために別名をエクスポート
