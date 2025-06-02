/**
 * カレンダー機能に関連するAPIサービス
 */
import supabase from "@/lib/supabase";

// 型定義
interface User {
  name: string;
  gender: string;
}

interface Calendar {
  timestamp: string;
}

interface ActionResponse {
  aid: string;
  action_name: string;
  happiness_change: number;
  Calendar: Calendar[];
  User: User;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    happiness_change: number;
    isPartner: boolean;
    userName: string;
  };
}

/**
 * カップル関係を取得する
 * @param userId ユーザーID
 * @returns パートナーのID
 */
export const getCoupleRelationship = async (
  userId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("Couple")
      .select("uid1, uid2")
      .or(`uid1.eq.${userId},uid2.eq.${userId}`)
      .single();

    if (error) {
      console.error("Error fetching couple data:", error);
      return null;
    }

    // パートナーのIDを特定
    return data.uid1 === userId ? data.uid2 : data.uid1;
  } catch (error) {
    console.error("Error in getCoupleRelationship:", error);
    return null;
  }
};

/**
 * ユーザーのイベントを取得する
 * @param userId ユーザーID
 * @returns ユーザーのイベント
 */
export const getUserEvents = async (
  userId: string
): Promise<ActionResponse[]> => {
  try {
    const { data, error } = await supabase
      .from("Action")
      .select(
        `
        aid,
        action_name,
        happiness_change,
        Calendar (
          timestamp
        ),
        User:User!Action_uid_fkey (
          name,
          gender
        )
      `
      )
      .eq("uid", userId);

    if (error) {
      console.error("Error fetching user events:", error);
      return [];
    }

    return data as unknown as ActionResponse[];
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    return [];
  }
};

/**
 * パートナーのイベントを取得する
 * @param partnerId パートナーID
 * @returns パートナーのイベント
 */
export const getPartnerEvents = async (
  partnerId: string
): Promise<ActionResponse[]> => {
  try {
    const { data, error } = await supabase
      .from("Action")
      .select(
        `
        aid,
        action_name,
        happiness_change,
        Calendar (
          timestamp
        ),
        User:User!Action_uid_fkey (
          name,
          gender
        )
      `
      )
      .eq("uid", partnerId);

    if (error) {
      console.error("Error fetching partner events:", error);
      return [];
    }

    return data as unknown as ActionResponse[];
  } catch (error) {
    console.error("Error in getPartnerEvents:", error);
    return [];
  }
};

/**
 * イベントをカレンダー形式に変換する
 * @param events イベント
 * @param isPartner パートナーのイベントかどうか
 * @returns カレンダー形式のイベント
 */
export const convertToCalendarEvents = (
  events: ActionResponse[],
  isPartner: boolean
): CalendarEvent[] => {
  return events
    .flatMap((item) => {
      return item.Calendar.map((calendar) => {
        return {
          id: `${isPartner ? "partner-" : ""}${item.aid}-${calendar.timestamp}`,
          title: item.action_name,
          start: calendar.timestamp,
          backgroundColor:
            item.User.gender === "male"
              ? isPartner
                ? "#2196f3"
                : "#64b5f6"
              : isPartner
              ? "#ff8a80"
              : "#e53935",
          borderColor:
            item.User.gender === "male"
              ? isPartner
                ? "#64b5f6"
                : "#2196f3"
              : isPartner
              ? "#ff8a80"
              : "#e53935",
          extendedProps: {
            happiness_change: item.happiness_change,
            isPartner,
            userName: item.User.name,
          },
        };
      });
    })
    .filter((event) => event.start);
};
