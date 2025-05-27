"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import Header from "@/components/display/header";
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
  point: number; // このpointは常に正の値なので、表示用として残す
  type: "like" | "sad";
  category: string;
  originalHappinessChange: number; // 元の符号付きポイント保持用
};

const ListContainer: React.FC = () => {
  const [items, setItems] = useState<ItemType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [actionName, setActionName] = useState("");
  // happinessChange をスライダーの直接の値として使用 (-100 から 100)
  const [happinessChange, setHappinessChange] = useState<number | null>(null);

  const [isShowingPartnerList, setIsShowingPartnerList] = useState(false);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [partnerUid, setPartnerUid] = useState<string | null>(null);
  const [listType, setListType] = useState<"like" | "sad">("like");
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<ItemType | null>(null);

  // コンポーネントロード時やフォーム表示時の初期化
  useEffect(() => {
    if (happinessChange === null) {
      // フォーム表示時の初期値として、例えば1を設定（0は登録不可のため）
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
    // 編集時は既存の happiness_change をそのまま設定
    setHappinessChange(item.originalHappinessChange);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItemId(null);
    setActionName("");
    setHappinessChange(1); // フォームを閉じるときはデフォルト値（0以外）にリセット
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

      const newHappiness = userData.happiness + confirmingItem.originalHappinessChange;

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

    // ポイントが0の場合は登録不可とするバリデーション
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
            happiness_change: happinessChange, // スライダーの値を直接使用
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
              happiness_change: happinessChange, // スライダーの値を直接使用
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

        const timestamp = new Date().toISOString();

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

  // スライダーのグラデーションを計算する関数
  // 値 (value) に応じてグラデーションのパーセンテージを調整
  const getSliderBackground = (value: number | null) => {
    if (value === null) return "linear-gradient(to right, #4169E1, #FF69B4)"; // デフォルト
    
    // -100から100の範囲を0-100%に正規化
    const normalizedValue = (value + 100) / 2; // 0-100の範囲

    // ピンク（赤）が負の領域に食い込むように色停止点を調整
    // 例: -100 (青) -> 0 (中間) -> 100 (赤/ピンク)
    // 0点を基準に、左にピンクを少し広げ、右にもピンクを広げる
    // ここでは、全体の40%までが青系、そこからピンク系に変わるようなイメージ
    const blueEnd = 40; // 青が終了する正規化されたパーセンテージ
    const pinkStart = 60; // ピンクが開始する正規化されたパーセンテージ

    // 値に基づいてグラデーションの位置を動的に調整
    // これは簡易的な例です。より複雑なグラデーションには詳細な計算が必要です。
    // 青 (低ポイント) -> 中間色 (0付近) -> ピンク/赤 (高ポイント)
    // 便宜上、0点を50%として、その左右で色を調整します。
    // 0 (中央) で色が完全に切り替わるのではなく、食い込ませるために、
    // 0より少し左からピンクが始まり、0より少し右まで青がある、といったイメージで
    const blueColor = "#4169E1"; // ロイヤルブルー
    const lightBlue = "#ADD8E6"; // ライトブルー
    const lightPink = "#FFC0CB"; // ライトピンク
    const redColor = "#FF6347"; // トマトレッド (ピンクより強めにしたい場合)

    // スライダーの背景グラデーションを動的に生成
    // valueが負の時は青が優勢、正の時は赤/ピンクが優勢
    // 0%が-100、50%が0、100%が100と仮定
    const blueStop = Math.max(0, 50 - value * 0.5); // value=100で0%, value=-100で100%
    const pinkStop = Math.min(100, 50 - value * 0.5); // value=100で0%, value=-100で100%

    // 負の領域で青が強く、正の領域でピンク/赤が強いグラデーション
    // 0付近で色が混ざる、または薄い中間色になるように調整
    return `linear-gradient(to right, ${blueColor}, ${lightBlue} 40%, ${lightPink} 60%, ${redColor})`;
    // または、もっと積極的にピンクを左に侵食させる場合 (例: -20%からピンクを開始)
    // return `linear-gradient(to right, ${blueColor} 0%, ${lightBlue} 30%, ${lightPink} 50%, ${redColor} 70%, ${redColor} 100%)`;
  };


  return (
    <div className="flex flex-col min-h-screen w-full relative">

      {/* インポートしたHeaderコンポーネントをページの最上部に配置 */}
      <Header />

      {/* 既存のヘッダー要素から「感情リスト」テキストを削除 */}
      <header className="w-full p-4 flex justify-end items-center z-10"> {/* justify-end に変更してボタンを右寄せ */}
        {/* 「感情リスト」のテキストは削除しました */}
        <button
          className="text-lg bg-blue-500 text-white px-2.5 py-2 rounded azuki-font"
          onClick={() => setIsShowingPartnerList(!isShowingPartnerList)}
          disabled={!partnerUid}
          title={!partnerUid ? "まだ相手が居ません。パートナーの情報を登録しましょう！" : undefined}
        >
          {isShowingPartnerList ? "自分のリストへ" : "相手のリストへ"}
        </button>
      </header>

      {/* mt-4 に変更し、ヘッダーとの間隔を短縮 */}
      <div className="flex justify-center items-start mt-4 mb-8">
        <div className="flex flex-row gap-4">
          {[
            { key: "like", label: ["嬉しいこと", "リスト"] },
            { key: "sad", label: ["悲しいこと", "リスト"] },
          ].map((item) => (
            <button
              key={item.key}
              className={`text-3xl px-8 py-8 rounded font-semibold azuki-font min-w-[220px] min-h-[100px] ${
                listType === item.key ? "bg-yellow-600 text-white azuki-font" : "bg-gray-300 azuki-font"
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
          <label className="block text-sm font-semibold mb-1 text-black azuki-font">出来事</label>
          <input
            type="text"
            placeholder="名前"
            value={actionName}
            onChange={(e) => setActionName(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-black"
          />

          {/* 感情の種類ボタンを削除しました */}

          {/* ポイント表示を大きく */}
          <label className="block text-xl font-bold mb-1 text-black">幸福度の変化: {happinessChange}</label>
          <input
            type="range" // typeをrangeに変更
            min="-100"   // 最小値
            max="100"    // 最大値
            step="1"     // 1刻み
            value={happinessChange !== null ? happinessChange : 0} // nullの場合のデフォルト値
            onChange={(e) => setHappinessChange(Number(e.target.value))} // スライダーの値を直接 happinessChange に設定
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: getSliderBackground(happinessChange), // グラデーションを動的に適用
            }}
          />
          {/* スライダーの0点の表示 */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>-100</span>
            <span className={happinessChange === 0 ? "font-bold text-red-500" : ""}>0</span> {/* 0の場合強調 */}
            <span>+100</span>
          </div>

          <div className="flex justify-end gap-4 mt-4"> {/* スライダーとの間に余白を追加 */}
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
        {items.length === 0 ? (
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
                  className={`flex-1 ${!isShowingPartnerList ? "cursor-pointer" : ""}`}
                  onClick={() => {!isShowingPartnerList && setConfirmingItem(item)}}
                >
                  <span className="text-2xl azuki-font">{item.name}</span>
                </div>

                <span
                  className={`font-bold text-4xl ${
                    item.type === "like" ? "text-pink-500 text-outline-white" : "text-blue-600 text-outline-white"
                  }`}
                >
                  {item.originalHappinessChange < 0 ? `-${item.point}` : item.point}
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
            setHappinessChange(1); // 新規追加時はスライダーをデフォルト値（1）に設定
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