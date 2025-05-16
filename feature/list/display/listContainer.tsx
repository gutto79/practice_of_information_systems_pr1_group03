"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import ListDisplay from "./listDisplay";
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
  type: string;
  category: string;
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

  const fetchUids = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const uid = user.id;
    setMyUid(uid);

    const { data: couple } = await supabase
      .from("Couple")
      .select("*")
      .or(`uid1.eq.${uid},uid2.eq.${uid}`)
      .single();

    if (couple) {
      const partner = couple.uid1 === uid ? couple.uid2 : couple.uid1;
      setPartnerUid(partner);
    }
  };

  const fetchActions = async () => {
    if (!myUid) return;

    const targetUid = isShowingPartnerList ? partnerUid : myUid;
    const isLikeList = listType === "like";

    const { data, error } = await supabase
      .from("Action")
      .select("*")
      .eq("uid", targetUid)
      .gt("happiness_change", isLikeList ? 0 : -Infinity)
      .lt("happiness_change", isLikeList ? Infinity : 0)
      .order("aid", { ascending: false });

    if (!error && data) {
      const transformed: ItemType[] = data.map((item: ActionItem) => ({
        id: item.aid,
        name: item.action_name,
        point: Math.abs(item.happiness_change),
        type: item.happiness_change >= 0 ? "like" : "sad",
        category: "default", // 必要に応じて調整
      }));
      setItems(transformed);
    } else {
      console.error("取得エラー:", error);
    }
  };

  useEffect(() => {
    fetchUids();
  }, []);

  useEffect(() => {
    fetchActions();
  }, [listType, isShowingPartnerList, myUid]);

  const handleSubmit = async () => {
    if (!actionName || myUid === null) return;

    try {
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
        return;
      }

      // Calendar にも同時登録
      const timestamp = new Date().toISOString();

      const { error: calendarError } = await supabase.from("Calendar").insert([
        {
          uid: myUid,
          aid: insertedAction.aid,
          timestamp,
        },
      ]);

      if (calendarError) {
        console.error("Calendar登録エラー:", calendarError);
        return;
      }

      setActionName("");
      setHappinessChange(0);
      setShowForm(false);
      fetchActions();
    } catch (error) {
      console.error("予期せぬエラー:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-16 relative">
      {/* 「嬉しいことリスト」「悲しいことリスト」 */}
      <div className="flex justify-center items-start mb-8">
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

      {/* 相手のリストへボタンを上部に配置 */}
      <div className="absolute top-0 right-0 p-4">
        <button
          className="text-sm bg-blue-500 text-white px-2 py-1 rounded h-[36px]"
          onClick={() => setIsShowingPartnerList(!isShowingPartnerList)}
        >
          {isShowingPartnerList ? "自分のリストへ" : "相手のリストへ"}
        </button>
      </div>

      {/* 登録フォーム */}
      {showForm && (
        <div className="mb-6 p-4 border rounded bg-gray-100">
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
                happinessChange >= 0 ? "bg-red-500 text-white border-red-700" : "bg-white text-red-500 border-red-300"
              }`}
              onClick={() => setHappinessChange(Math.abs(happinessChange))}
              type="button"
            >
              ❤️ 嬉しい
            </button>
            <button
              className={`flex-1 border rounded p-2 text-center font-semibold transition duration-150 ${
                happinessChange < 0 ? "bg-blue-500 text-white border-blue-700" : "bg-white text-blue-500 border-blue-300"
              }`}
              onClick={() => setHappinessChange(-Math.abs(happinessChange))}
              type="button"
            >
              💙 悲しい
            </button>
          </div>

          <label className="block text-sm font-semibold mb-1 text-black">ポイント</label>
          <input
            type="number"
            placeholder="ポイント"
            value={Math.abs(happinessChange)}
            onChange={(e) =>
              setHappinessChange(
                happinessChange >= 0
                  ? Math.abs(Number(e.target.value))
                  : -Math.abs(Number(e.target.value))
              )
            }
            className="border p-2 rounded w-full mb-4 text-black"
          />

          <div className="flex justify-between">
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              戻る
            </button>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              登録
            </button>
          </div>
        </div>
      )}

      {/* リスト表示 */}
      <ListDisplay items={items} />

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-4xl shadow-md hover:bg-blue-700"
        >
          ＋
        </button>
      )}

      <Footer />
    </div>
  );
};

export default ListContainer;