/**
 * ホーム機能に関連するAPIサービス
 */
import supabase from "@/lib/supabase";
import { Invite, RecentAction } from "../types/types";

/**
 * ユーザーの詳細情報を取得する
 * @param userId ユーザーID
 * @returns ユーザーの詳細情報
 */
export const getUserDetails = async (userId: string) => {
  const { data, error } = await supabase
    .from("User")
    .select("happiness, gender, name")
    .eq("uid", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * ユーザーのカップル関係を取得する
 * @param userId ユーザーID
 * @returns カップル関係の情報
 */
export const getCoupleRelationship = async (userId: string) => {
  const { data, error } = await supabase
    .from("Couple")
    .select("uid1, uid2")
    .or(`uid1.eq.${userId},uid2.eq.${userId}`)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 は記録が見つからないエラー
    throw error;
  }

  return data;
};

/**
 * ユーザーの最近のアクションを取得する
 * @param userId ユーザーID
 * @returns 最近のアクション一覧
 */
export const getRecentActions = async (
  userId: string
): Promise<RecentAction[]> => {
  const { data, error } = await supabase
    .from("Calendar")
    .select(
      `
      aid,
      timestamp,
      Action!inner (
        action_name,
        happiness_change,
        uid
      )
    `
    )
    .eq("Action.uid", userId)
    .order("timestamp", { ascending: false })
    .limit(5);

  if (error) throw error;

  if (!data || data.length === 0) {
    return [];
  }

  // データの整形
  const formattedActions = data
    .filter((record) => record && record.Action)
    .map((record) => {
      const action = Array.isArray(record.Action)
        ? record.Action[0]
        : record.Action;
      if (!action) return null;

      return {
        action_name: action.action_name,
        timestamp: record.timestamp,
        happiness_change: action.happiness_change,
      };
    })
    .filter((action): action is RecentAction => action !== null);

  return formattedActions;
};

/**
 * 受け取った招待を取得する
 * @param userId ユーザーID
 * @returns 招待一覧
 */
export const getPendingInvites = async (userId: string): Promise<Invite[]> => {
  const { data, error } = await supabase
    .from("Invite")
    .select(
      `
      *,
      from_user:from_uid (
        uid,
        name
      )
    `
    )
    .eq("to_uid", userId)
    .eq("status", "pending");

  if (error) throw error;
  return data || [];
};

/**
 * 送信した招待を取得する
 * @param userId ユーザーID
 * @returns 送信した招待一覧
 */
export const getSentInvites = async (userId: string): Promise<Invite[]> => {
  const { data, error } = await supabase
    .from("Invite")
    .select(
      `
      *,
      to_user:to_uid (
        uid,
        name
      )
    `
    )
    .eq("from_uid", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 招待を送信する
 * @param fromUserId 送信元ユーザーID
 * @param toUserId 送信先ユーザーID
 * @returns 作成された招待情報
 */
export const sendInvite = async (fromUserId: string, toUserId: string) => {
  // ユーザーの存在確認
  const { data: targetUser, error: userError } = await supabase
    .from("User")
    .select("uid, name")
    .eq("uid", toUserId)
    .single();

  if (userError || !targetUser) {
    throw new Error("ユーザーが見つかりません");
  }

  // 既存の招待確認
  const { data: existingInvite } = await supabase
    .from("Invite")
    .select("*")
    .eq("from_uid", fromUserId)
    .eq("to_uid", toUserId)
    .eq("status", "pending")
    .single();

  if (existingInvite) {
    throw new Error("すでに招待中です");
  }

  // 招待の作成
  const { data: newInvite, error: inviteError } = await supabase
    .from("Invite")
    .insert({ from_uid: fromUserId, to_uid: toUserId, status: "pending" })
    .select()
    .single();

  if (inviteError) {
    throw new Error("招待に失敗しました");
  }

  return { newInvite, targetUser };
};

/**
 * 招待を承諾する
 * @param invite 招待情報
 * @returns パートナーの情報
 */
export const acceptInvite = async (invite: Invite) => {
  // 既存のカップル関係確認
  const { data: existingCouple, error: coupleError } = await supabase
    .from("Couple")
    .select("*")
    .or(
      `uid1.eq.${invite.from_uid},uid2.eq.${invite.from_uid},uid1.eq.${invite.to_uid},uid2.eq.${invite.to_uid}`
    );

  if (coupleError) throw coupleError;

  if (existingCouple && existingCouple.length > 0) {
    throw new Error("すでにペアリングされています");
  }

  // 自分自身への招待確認
  if (invite.from_uid === invite.to_uid) {
    throw new Error("自分自身を招待できません");
  }

  // 招待ステータス更新
  await supabase
    .from("Invite")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  // カップル関係作成
  const { error: insertError } = await supabase
    .from("Couple")
    .insert({ uid1: invite.from_uid, uid2: invite.to_uid });

  if (insertError) throw insertError;

  // 招待レコード削除
  await supabase.from("Invite").delete().eq("id", invite.id);

  // パートナー情報取得
  const { data: partnerData, error: partnerError } = await supabase
    .from("User")
    .select("happiness, gender, name")
    .eq("uid", invite.from_uid)
    .single();

  if (partnerError) throw partnerError;

  return partnerData;
};

/**
 * 招待を拒否する
 * @param inviteId 招待ID
 */
export const declineInvite = async (inviteId: number) => {
  await supabase
    .from("Invite")
    .update({ status: "declined" })
    .eq("id", inviteId);
};

/**
 * 招待を削除する
 * @param inviteId 招待ID
 */
export const deleteInvite = async (inviteId: number) => {
  const { error } = await supabase.from("Invite").delete().eq("id", inviteId);
  if (error) {
    throw new Error("削除に失敗しました");
  }
};

/**
 * カップル関係を解消する
 * @param userId ユーザーID
 * @param partnerId パートナーID
 */
export const breakupCouple = async (userId: string, partnerId: string) => {
  await supabase
    .from("Couple")
    .delete()
    .or(
      `and(uid1.eq.${userId},uid2.eq.${partnerId}),and(uid1.eq.${partnerId},uid2.eq.${userId})`
    );
};
