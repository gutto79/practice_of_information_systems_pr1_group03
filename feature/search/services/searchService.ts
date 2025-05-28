/**
 * 検索機能に関連するAPIサービス
 */
import { createClient } from "@supabase/supabase-js";
import { FilterType, Item } from "../types/types";

// Supabase ブラウザクライアント
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/**
 * 現在のユーザーIDを取得する
 * @returns ユーザーID
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return null;
  }
};

/**
 * 検索条件に基づいてアクションを取得する
 * @param query 検索クエリ
 * @param type フィルタータイプ
 * @returns 検索結果
 */
export const searchActions = async (
  query: string,
  type: FilterType
): Promise<{ happy: Item[]; bad: Item[] }> => {
  try {
    // ① Action 取得（フィルタ適用）
    let q = supabase
      .from("Action")
      .select("aid, action_name, happiness_change");

    if (query) q = q.ilike("action_name", `%${query}%`);
    if (type === "positive") q = q.gt("happiness_change", 0);
    if (type === "negative") q = q.lt("happiness_change", 0);

    const { data: actions = [] } = await q;

    // ② Like 行を取得して集計
    const aidList = (actions ?? []).map((a) => a.aid);
    const { data: likeRows = [] } = await supabase
      .from("Like")
      .select("aid, uid")
      .in("aid", aidList);

    const likeMap: Record<number, number> = {};
    (likeRows ?? []).forEach(
      (r) => (likeMap[r.aid] = (likeMap[r.aid] ?? 0) + 1)
    );

    // ログインユーザの liked セット
    const uid = await getCurrentUserId();
    const likedSet = new Set<number>();
    if (uid)
      (likeRows ?? []).forEach((r) => {
        if (r.uid === uid) likedSet.add(r.aid);
      });

    // ③ 整形・振り分け
    const all: Item[] = (actions ?? []).map(
      (a: { aid: number; action_name: string; happiness_change: number }) => ({
        id: a.aid,
        label: a.action_name,
        weight: a.happiness_change,
        like_count: likeMap[a.aid] ?? 0,
        liked: likedSet.has(a.aid),
        isHappy: a.happiness_change > 0,
      })
    );

    return {
      happy: all
        .filter((i) => i.isHappy)
        .sort((a, b) => b.like_count - a.like_count),
      bad: all
        .filter((i) => !i.isHappy)
        .sort((a, b) => b.like_count - a.like_count),
    };
  } catch (error) {
    console.error("検索エラー:", error);
    return { happy: [], bad: [] };
  }
};

/**
 * いいね/いいね解除を行う
 * @param aid アクションID
 * @param liked 現在のいいね状態
 * @returns 成功したかどうか
 */
export const toggleLike = async (
  aid: number,
  liked: boolean
): Promise<boolean> => {
  try {
    const uid = await getCurrentUserId();
    if (!uid) {
      throw new Error("ログインしてください");
    }

    if (liked) {
      await supabase.from("Like").delete().eq("uid", uid).eq("aid", aid);
    } else {
      await supabase.from("Like").insert({ uid, aid });
    }

    return true;
  } catch (error) {
    console.error("いいね処理エラー:", error);
    return false;
  }
};
