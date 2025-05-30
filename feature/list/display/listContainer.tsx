"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Header from "@/components/display/header";
import Footer from "@/components/display/Footer";

const getJstIsoString = (): string => {
  const date = new Date();
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().replace("Z", "");
};

type ActionItem = {
  aid: number;
  action_name: string;
  happiness_change: number;
  uid: string;
};

type ItemType = {
  id: number;
  name: string;
  point: number;
  type: "like" | "sad";
  category: string;
  originalHappinessChange: number;
};

const ListContainer: React.FC = () => {
  const [items, setItems] = useState<ItemType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [actionName, setActionName] = useState("");
  const [happinessChange, setHappinessChange] = useState<number | null>(null);

  const [isShowingPartnerList, setIsShowingPartnerList] = useState(false);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [partnerUid, setPartnerUid] = useState<string | null>(null);
  const [listType, setListType] = useState<"like" | "sad">("like");
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<ItemType | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (happinessChange === null) {
      setHappinessChange(1);
    }
  }, [happinessChange]);

  const fetchUids = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("ユーザー取得エラー:", userError);
        return;
      }

      if (!user) return;

      const uid = user.id;
      setMyUid(uid);

      const { data: couple, error: coupleError } = await supabase
        .from("Couple")
        .select("*")
        .or(`uid1.eq.${uid},uid2.eq.${uid}`)
        .maybeSingle();

      if (coupleError) {
        console.error("カップル情報取得エラー:", coupleError);
        setPartnerUid(null);
        return;
      }

      if (couple) {
        const partner = couple.uid1 === uid ? couple.uid2 : couple.uid1;
        setPartnerUid(partner);
      } else {
        setPartnerUid(null);
      }
    } catch (error) {
      console.error("fetchUids 予期せぬエラー:", error);
    }
  };

  const fetchActions = async () => {
    try {
      const targetUid = isShowingPartnerList ? partnerUid : myUid;
      if (!targetUid) {
        setItems([]);
        return;
      }

      let query = supabase
        .from("Action")
        .select("*")
        .eq("uid", targetUid)
        .order("aid", { ascending: false });

      if (listType === "like") {
        query = query.gte("happiness_change", 0);
      } else {
        query = query.lt("happiness_change", 0);
      }

      if (searchText) {
        query = query.ilike("action_name", `%${searchText}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("取得エラー:", error);
        setItems([]);
        return;
      }

      if (!data) {
        setItems([]);
        return;
      }

      const transformed: ItemType[] = data.map((item: ActionItem) => ({
        id: item.aid,
        name: item.action_name,
        point: Math.abs(item.happiness_change),
        type: item.happiness_change >= 0 ? "like" : "sad",
        category: "default",
        originalHappinessChange: item.happiness_change,
      }));
      setItems(transformed);
    } catch (error) {
      console.error("fetchActions 予期せぬエラー:", error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchUids();
  }, []);

  useEffect(() => {
    fetchActions();
  }, [listType, isShowingPartnerList, myUid, partnerUid, searchText]);

  const startEdit = (item: ItemType) => {
    setEditingItemId(item.id);
    setActionName(item.name);
    setHappinessChange(item.originalHappinessChange);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItemId(null);
    setActionName("");
    setHappinessChange(1);
  };

  const handleConfirmYes = async () => {
    if (!confirmingItem || !myUid) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("happiness")
        .eq("uid", myUid)
        .single();

      if (userError || !userData) {
        console.error("ユーザーの幸福度取得エラー:", userError);
        return;
      }

      const newHappiness =
        userData.happiness + confirmingItem.originalHappinessChange;

      const { error: updateError } = await supabase
        .from("User")
        .update({ happiness: newHappiness })
        .eq("uid", myUid);

      if (updateError) {
        console.error("幸福度の更新エラー:", updateError);
        return;
      }

      setConfirmingItem(null);
    } catch (error) {
      console.error("handleConfirmYes エラー:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !actionName ||
      happinessChange === null ||
      isNaN(happinessChange) ||
      myUid === null ||
      loading
    ) {
      alert("名前とポイントの両方を入力してください。");
      return;
    }

    if (happinessChange === 0) {
      alert("ポイントは0以外の値に設定してください。");
      return;
    }

    setLoading(true);

    try {
      if (editingItemId !== null) {
        const { error: updateError } = await supabase
          .from("Action")
          .update({
            action_name: actionName,
            happiness_change: happinessChange,
          })
          .eq("aid", editingItemId);

        if (updateError) {
          console.error("Action更新エラー:", updateError);
          setLoading(false);
          return;
        }
      } else {
        const { data: insertedAction, error: actionError } = await supabase
          .from("Action")
          .insert([
            {
              uid: myUid,
              action_name: actionName,
              happiness_change: happinessChange,
            },
          ])
          .select()
          .single();

        if (actionError) {
          if (actionError.code === "23505") {
            alert("同じ出来事はすでに登録されています。");
          } else {
            console.error("Action登録エラー:", actionError);
          }

          setLoading(false);
          return;
        }

        const timestamp = getJstIsoString();

        const { error: calendarError } = await supabase
          .from("Calendar")
          .insert([
            {
              aid: insertedAction.aid,
              timestamp,
            },
          ]);

        if (calendarError) {
          console.error("Calendar登録エラー:", calendarError);
        }
      }

      cancelForm();
      fetchActions();
    } catch (error) {
      console.error("予期せぬエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSliderBackground = (value: number | null) => {
    if (value === null) {
      return "linear-gradient(to right, #4169E1, #FFC0CB 50%, #FF6347)";
    }

    const normalizedValue = (value + 100) / 2;

    const blueColor = "#4169E1";
    const lightBlue = "#ADD8E6";
    const middleColor = "#E0E0E0";
    const lightPink = "#FFC0CB";
    const redColor = "#FF6347";

    const blueEndStop = 40;
    const pinkStartStop = 60;

    return `linear-gradient(to right, ${blueColor}, ${lightBlue} ${blueEndStop}%, ${middleColor} 50%, ${lightPink} ${pinkStartStop}%, ${redColor})`;
  };

  return (
    <div className="flex flex-col h-screen w-full relative overflow-hidden">
      <Header />

      <header className="w-full p-4 flex justify-end items-center z-10">
        <button
          className="text-lg bg-blue-500 text-white px-2.5 py-2 rounded azuki-font"
          onClick={() => setIsShowingPartnerList(!isShowingPartnerList)}
          disabled={!partnerUid}
          title={
            !partnerUid
              ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
              : undefined
          }
        >
          {isShowingPartnerList ? "自分のリストへ" : "相手のリストへ"}
        </button>
      </header>

      <div className="flex justify-center items-start mt-4 mb-8">
        <div className="flex flex-row gap-4">
          {[
            { key: "like", label: ["嬉しいこと", "リスト"] },
            { key: "sad", label: ["悲しいこと", "リスト"] },
          ].map((item) => (
            <button
              key={item.key}
              className={`text-3xl px-8 py-8 rounded font-semibold azuki-font min-w-[220px] min-h-[100px] ${
                listType === item.key
                  ? item.key === "like"
                    ? "bg-pink-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              } azuki-font`}
              onClick={() => setListType(item.key as "like" | "sad")}
            >
              <div className="leading-tight">
                {item.label.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 検索機能 */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-white p-2 rounded border">
          <input
            type="text"
            placeholder="アイテムを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 border rounded px-3 py-2 bg-white text-black"
          />
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-4 mx-8 border rounded bg-gray-100">
          <label className="block text-sm font-semibold mb-1 text-black azuki-font">
            出来事
          </label>
          <input
            type="text"
            placeholder="名前"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-black"
          />

          <label className="block text-3xl font-bold mb-3 text-black">
            幸福度の変化: {happinessChange}
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={happinessChange !== null ? happinessChange : 0}
            onChange={(e) => setHappinessChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: getSliderBackground(happinessChange),
            }}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>-100</span>
            <span
              className={happinessChange === 0 ? "font-bold text-red-500" : ""}
            >
              0
            </span>
            <span>+100</span>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={cancelForm}
              className="px-6 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500"
              type="button"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
              type="button"
              disabled={loading}
            >
              {editingItemId !== null ? "保存" : "登録"}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-16 px-4">
        {loading ? (
          <div className="text-center mt-20 text-black">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="text-center mt-20 text-black">
            {isShowingPartnerList && !partnerUid
              ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
              : "リストが空です。"}
          </div>
        ) : (
          <ul className="space-y-4 w-full">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-3 px-4 bg-white text-black rounded-lg shadow-sm"
              >
                {!isShowingPartnerList && (
                  <button
                    onClick={() => startEdit(item)}
                    className="mr-3 text-black hover:text-gray-700"
                    aria-label={`編集: ${item.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536M16.5 3.75a2.25 2.25 0 113.182 3.182L7.5 19.5H4.5v-3l12-12z"
                      />
                    </svg>
                  </button>
                )}

                <div
                  className={`flex-1 ${
                    !isShowingPartnerList ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    !isShowingPartnerList && setConfirmingItem(item);
                  }}
                >
                  <span className="text-2xl azuki-font">{item.name}</span>
                </div>

                <span
                  className={`font-bold text-4xl ${
                    item.type === "like"
                      ? "text-pink-500 text-outline-white"
                      : "text-blue-600 text-outline-white"
                  }`}
                >
                  {item.originalHappinessChange < 0
                    ? `-${item.point}`
                    : item.point}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {confirmingItem && (
        // ★ここを修正：背景を現在の背景色を活かした半透明にする
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <p className="text-lg font-semibold mb-4 text-black">
              「{confirmingItem.name}」というイベントがありましたか？
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleConfirmYes}
              >
                はい
              </button>
              <button
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setConfirmingItem(null)}
              >
                いいえ
              </button>
              </div>
          </div>
        </div>
      )}

      {!isShowingPartnerList && !showForm && (
        <button
          onClick={() => {
            setEditingItemId(null);
            setActionName("");
            setHappinessChange(1);
            setShowForm(true);
          }}
          className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-purple-500 text-white text-4xl flex items-center justify-center shadow-lg hover:bg-purple-600 z-50"
          aria-label="新しい出来事を追加"
        >
          ＋
        </button>
      )}
      <Footer />
    </div>
  );
};

export default ListContainer;