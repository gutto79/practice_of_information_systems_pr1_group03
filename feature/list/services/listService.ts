/**
 * リスト機能に関連するAPIサービス
 */
import supabase from "@/lib/supabase";
import { ActionItem, ItemType } from "@/types";

/**
 * ユーザーのカップル関係を取得する
 * @param userId ユーザーID
 * @returns カップル関係の情報
 */
export const getCoupleRelationship = async (userId: string) => {
  const { data, error } = await supabase
    .from("Couple")
    .select("*")
    .or(`uid1.eq.${userId},uid2.eq.${userId}`)
    .maybeSingle();

  if (error) {
    console.error("カップル情報取得エラー:", error);
    return null;
  }

  if (data) {
    const partner = data.uid1 === userId ? data.uid2 : data.uid1;
    return partner;
  }

  return null;
};

/**
 * ユーザーのアクションを取得する
 * @param userId ユーザーID
 * @param listType リストタイプ（"like" または "sad"）
 * @returns アクションのリスト
 */
export const getActions = async (
  userId: string | null,
  listType: "like" | "sad"
): Promise<ItemType[]> => {
  if (!userId) {
    return [];
  }

  try {
    let query = supabase
      .from("Action")
      .select("*")
      .eq("uid", userId)
      .order("aid", { ascending: false });

    if (listType === "like") {
      query = query.gte("happiness_change", 0);
    } else {
      query = query.lt("happiness_change", 0);
    }

    const { data, error } = await query;

    if (error) {
      console.error("取得エラー:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    const transformed: ItemType[] = data.map((item: ActionItem) => ({
      id: item.aid,
      name: item.action_name,
      point: Math.abs(item.happiness_change),
      type: item.happiness_change >= 0 ? "like" : "sad",
      category: "default",
      originalHappinessChange: item.happiness_change,
    }));

    return transformed;
  } catch (error) {
    console.error("getActions 予期せぬエラー:", error);
    return [];
  }
};

/**
 * ユーザーの幸福度を取得する
 * @param userId ユーザーID
 * @returns ユーザーの幸福度
 */
export const getUserHappiness = async (
  userId: string
): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("happiness")
      .eq("uid", userId)
      .single();

    if (error || !data) {
      console.error("ユーザーの幸福度取得エラー:", error);
      return null;
    }

    return data.happiness;
  } catch (error) {
    console.error("getUserHappiness エラー:", error);
    return null;
  }
};

/**
 * ユーザーの幸福度を更新する
 * @param userId ユーザーID
 * @param newHappiness 新しい幸福度
 * @returns 更新が成功したかどうか
 */
export const updateUserHappiness = async (
  userId: string,
  newHappiness: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("User")
      .update({ happiness: newHappiness })
      .eq("uid", userId);

    if (error) {
      console.error("幸福度の更新エラー:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("updateUserHappiness エラー:", error);
    return false;
  }
};

/**
 * アクションを更新する
 * @param actionId アクションID
 * @param actionName アクション名
 * @param happinessChange 幸福度の変化
 * @returns 更新が成功したかどうか
 */
export const updateAction = async (
  actionId: number,
  actionName: string,
  happinessChange: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("Action")
      .update({
        action_name: actionName,
        happiness_change: happinessChange,
      })
      .eq("aid", actionId);

    if (error) {
      console.error("Action更新エラー:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("updateAction エラー:", error);
    return false;
  }
};

/**
 * アクションを作成する
 * @param userId ユーザーID
 * @param actionName アクション名
 * @param happinessChange 幸福度の変化
 * @returns 作成されたアクションID
 */
export const createAction = async (
  userId: string,
  actionName: string,
  happinessChange: number
): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from("Action")
      .insert([
        {
          uid: userId,
          action_name: actionName,
          happiness_change: happinessChange,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("同じ出来事はすでに登録されています。");
      } else {
        console.error("Action登録エラー:", error);
        return null;
      }
    }

    return data.aid;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("createAction エラー:", error);
    return null;
  }
};

/**
 * カレンダーにイベントを追加する
 * @param actionId アクションID
 * @param timestamp タイムスタンプ
 * @returns 追加が成功したかどうか
 */
export const addToCalendar = async (
  actionId: number,
  timestamp: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("Calendar").insert([
      {
        aid: actionId,
        timestamp,
      },
    ]);

    if (error) {
      console.error("Calendar登録エラー:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("addToCalendar エラー:", error);
    return false;
  }
};

/**
 * ユーザー情報を取得する
 * @param userId ユーザーID
 * @returns ユーザー情報
 */
export const getUserInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("uid", userId)
      .single();

    if (error) {
      console.error("ユーザー情報取得エラー:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("getUserInfo エラー:", error);
    return null;
  }
};

/**
 * 自分とパートナーの名前を取得する
 * @param userId 自分のユーザーID
 * @returns 自分とパートナーの名前
 */
export const getUserNames = async (userId: string) => {
  try {
    // 自分の情報を取得
    const myInfo = await getUserInfo(userId);

    // パートナーのIDを取得
    const partnerId = await getCoupleRelationship(userId);

    // パートナーの情報を取得
    const partnerInfo = partnerId ? await getUserInfo(partnerId) : null;

    return {
      myName: myInfo?.name || "あなた",
      partnerName: partnerInfo?.name || "パートナー",
    };
  } catch (error) {
    console.error("getUserNames エラー:", error);
    return {
      myName: "あなた",
      partnerName: "パートナー",
    };
  }
};
