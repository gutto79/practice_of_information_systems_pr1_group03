"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Footer from "@/components/display/Footer";

// 1. ListContainer コンポーネントのファイルの上の方（import文の下など）に次を追加
const getJstIsoString = (): string => {
  const date = new Date();
  // UTC時間に9時間を足して日本時間にする
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  // ISO形式の文字列を作り、末尾の「Z」を取り除く
  // 例: "2025-05-20T15:00:00.000"（日本時間）
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
  originalHappinessChange: number; // 元の符号付きポイント保持用
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

  const deleteItem = async (aid: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      setLoading(true);

      // ✅【追加】まずCalendarテーブルから削除
      const { error: calendarError } = await supabase
        .from("Calendar")
        .delete()
        .eq("aid", aid);

      if (calendarError) {
        console.error("カレンダーの削除に失敗:", calendarError.message);
        return; // Calendarの削除に失敗したら処理を中断
      }

      // ✅【元からある処理】Actionテーブルから削除
      const { error } = await supabase.from("Action").delete().eq("aid", aid);

      if (error) {
        console.error("Actionの削除に失敗:", error.message);
        return;
      }

      // ✅【元からある処理】ローカル状態からも削除（画面即更新）
      setItems((prevItems) => prevItems.filter((item) => item.id !== aid));
    } catch (err) {
      console.error("予期せぬエラー:", err);
    } finally {
      setLoading(false);
    }
  };

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
  }, [listType, isShowingPartnerList, myUid, partnerUid]);

  const startEdit = (item: ItemType) => {
    setEditingItemId(item.id);
    setActionName(item.name);
    setHappinessChange(item.originalHappinessChange);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItemId(null); // ← 念のためここで null に戻すの重要
    setActionName("");
    setHappinessChange(null);
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

      setConfirmingItem(null); // モーダルを閉じる
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

  return (
    <div className="flex flex-col min-h-screen w-full relative">
      {/* 上部の空白を白で埋めるための背景 */}
      <div className="fixed top-0 left-0 w-full h-15 bg-white z-[1]" />

      <header className="w-full bg-white p-4 flex justify-between items-center sticky top-10 z-10">
        <div className="azuki-font text-2xl font-bold text-pink-500 blue-outline">
          感情リスト
        </div>
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

        {/* 均等な波（上用） */}
        <div className="absolute bottom-[-15px] left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg
            className="relative block w-full h-[32px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 Q 100,60 200,30 T 400,30 T 600,30 T 800,30 T 1000,30 T 1200,30 V120 H0 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </header>
      <div className="flex justify-center items-start mt-17 mb-8">
        <div className="flex flex-row gap-4">
          {[
            { key: "like", label: ["嬉しいこと", "リスト"] },
            { key: "sad", label: ["悲しいこと", "リスト"] },
          ].map((item) => (
            <button
              key={item.key}
              className={`text-3xl px-8 py-8 rounded font-semibold azuki-font min-w-[220px] min-h-[100px] ${
                listType === item.key
                  ? "bg-yellow-600 text-white azuki-font"
                  : "bg-gray-300 azuki-font"
              }`}
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

          <label className="block text-sm font-semibold mb-2 text-black">
            感情の種類
          </label>
          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 border rounded p-2 text-center font-semibold transition duration-150 ${
                happinessChange >= 0
                  ? "bg-red-500 text-white border-red-700"
                  : "bg-white text-red-500 border-red-500"
              }`}
              onClick={() => setHappinessChange(1)}
              type="button"
            >
              嬉しい
            </button>
            <button
              className={`flex-1 border rounded p-2 text-center font-semibold transition duration-150 ${
                happinessChange < 0
                  ? "bg-blue-500 text-white border-blue-700"
                  : "bg-white text-blue-500 border-blue-500"
              }`}
              onClick={() => setHappinessChange(-1)}
              type="button"
            >
              悲しい
            </button>
          </div>

          <label className="block text-sm font-semibold mb-1 text-black">
            ポイント
          </label>
          <input
            type="number"
            value={
              typeof happinessChange === "number"
                ? Math.abs(happinessChange)
                : ""
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setHappinessChange(null);
              } else {
                const num = Number(val);
                setHappinessChange(
                  typeof happinessChange === "number" && happinessChange < 0
                    ? -num
                    : num
                );
              }
            }}
            className="border p-2 rounded w-full mb-4 text-black"
            min={0}
          />

          <div className="flex justify-end gap-4">
            <button
              onClick={cancelForm}
              className="px-6 py-2 rounded bg-gray-400 text-white font-semibold hover:bg-gray-500"
              type="button"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
              type="button"
              disabled={loading}
            >
              {editingItemId !== null ? "保存" : "登録"}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mx-8 mb-16">
        {items.length === 0 ? (
          <div className="text-center mt-20 text-black">
            {isShowingPartnerList && !partnerUid
              ? "まだ相手が居ません。パートナーの情報を登録しましょう！"
              : "リストが空です。"}
          </div>
        ) : (
          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b py-3"
              >
                {/* 編集ボタン（ペンマーク） */}
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

                {/* イベント名を押すと確認ダイアログを開く */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setConfirmingItem(item)}
                >
                  <span className="text-2xl azuki-font">{item.name}</span>
                </div>

                {/* ポイント表示 */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <p className="text-lg font-semibold mb-4 text-black">
              「{confirmingItem.name}」というイベントがありましたか？
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
            setHappinessChange(null);
            setShowForm(true);
          }}
          className="fixed bottom-20 right-6 w-16 h-16 rounded-full bg-green-500 text-white text-4xl flex items-center justify-center shadow-lg hover:bg-green-600 z-50"
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
