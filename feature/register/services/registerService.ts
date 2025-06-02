/**
 * 登録機能に関連するAPIサービス
 */
import supabase from "@/lib/supabase";

/**
 * ユーザー情報を登録する
 * @param uid ユーザーID
 * @param name ユーザー名
 * @param gender 性別
 * @returns 登録が成功したかどうか
 */
export const registerUser = async (
  uid: string,
  name: string,
  gender: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("User").insert([
      {
        uid: uid,
        name: name,
        gender: gender,
        happiness: 50, // デフォルト値
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
