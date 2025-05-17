"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Footer from "@/components/display/Footer";

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
  const [happinessChange, setHappinessChange] = useState<number>(0);
  const [isShowingPartnerList, setIsShowingPartnerList] = useState(false);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [partnerUid, setPartnerUid] = useState<string | null>(null);
  const [listType, setListType] = useState<"like" | "sad">("like");
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

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
    setEditingItemId(null);
    setActionName("");
    setHappinessChange(0);
  };

  const handleSubmit = async () => {
    if (!actionName || myUid === null || loading) return;

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

        if (actionError || !insertedAction) {
          console.error("Action登録エラー:", actionError);
          setLoading(false);
          return;
        }

        const timestamp = new Date().toISOString();

        const { error: calendarError } = await supabase.from("Calendar").insert([
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
      <header className="w-full bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="text-xl font-bold text-black">感情リスト</div>
        <button
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => setIsShowingPartnerList(!isShowingPartnerList)}
          disabled={!partnerUid}
          title={!partnerUid ? "まだ相手が居ません。パートナーの情報を登録しましょう！" : undefined}
        >
          {isShowingPartnerList ? "自分のリストへ" : "相手のリストへ"}
        </button>
      </header>

      <div className="flex justify-center items-start my-8">
        <div className="flex flex-row gap-4">
          {[
            { key: "like", label: ["嬉しいこと", "リスト"] },
            { key: "sad", label: ["悲しいこと", "リスト"] },
          ].map((item) => (
            <button
              key={item.key}
              className={`text-3xl px-8 py-8 rounded font-semibold min-w-[220px] min-h-[100px] ${
                listType === item.key ? "bg-yellow-600 text-white" : "bg-gray-300"
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
          <label className="block text-sm font-semibold mb-1 text-black">出来事</label>
          <input
            type="text"
            placeholder="名前"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-black"
          />

          <label className="block text-sm font-semibold mb-2 text-black">感情の種類</label>
          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 border rounded p-2 text-center font-semibold transition duration-150 ${
                happinessChange >= 0 ? "bg-red-500 text-white border-red-700" : "bg-white text-red-500 border-red-500"
              }`}
              onClick={() => setHappinessChange(1)}
              type="button"
            >
              嬉しい
            </button>
            <button
              className={`flex-1 border rounded p-2 text-center font-semibold transition duration-150 ${
                happinessChange < 0 ? "bg-blue-500 text-white border-blue-700" : "bg-white text-blue-500 border-blue-500"
              }`}
              onClick={() => setHappinessChange(-1)}
              type="button"
            >
              悲しい
            </button>
          </div>

          <label className="block text-sm font-semibold mb-1 text-black">ポイント</label>
          <input
            type="number"
            value={Math.abs(happinessChange)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setHappinessChange(happinessChange < 0 ? -val : val);
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
                <button
                  onClick={() => startEdit(item)}
                  className="mr-3 text-black hover:text-gray-700"
                  aria-label={`編集: ${item.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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

                <span className="flex-1 text-lg">{item.name}</span>

                <span
                  className={`font-bold text-4xl ${
                    item.type === "like" ? "text-black" : "text-blue-600"
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

      <Footer />
    </div>
  );
};

export default ListContainer;