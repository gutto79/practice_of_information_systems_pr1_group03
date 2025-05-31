/*───────────────────────────────────────────────*/
/* feature/search/display/SearchClient.tsx      */
/*───────────────────────────────────────────────*/
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/*─────────────────────*
 * 型宣言
 *─────────────────────*/
type FilterType = "" | "positive" | "negative";
type SortOrder = "asc" | "desc";
type GenderFilter = "all" | "male" | "female"; // 性別フィルターの型を追加

interface Item {
  id: number;
  label: string;
  weight: number;
  like_count: number;
  liked: boolean;
  isHappy: boolean;
}

interface Props {
  initialQuery: string;
  initialType: FilterType;
}

/*─────────────────────*
 * Supabase ブラウザクライアント
 *─────────────────────*/
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/*─────────────────────*
 * メインコンポーネント
 *─────────────────────*/
const SearchClient: React.FC<Props> = ({ initialQuery, initialType }) => {
  /* URL パラメータ */
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const typeParam = (searchParams.get("type") ?? "") as FilterType;
  const genderParam = (searchParams.get("gender") ?? "all") as GenderFilter; // 性別パラメータを追加

  /* フォーム state */
  const [query, setQuery] = React.useState<string>(initialQuery);
  const [type, setType] = React.useState<FilterType>(initialType);
  const [activeSection, setActiveSection] = React.useState<"all" | "happy" | "bad">("happy");
  const [genderFilter, setGenderFilter] = React.useState<GenderFilter>(genderParam); // 性別フィルターのstateを追加

  /* 検索結果 state */
  const [items, setItems] = React.useState<{ happy: Item[]; bad: Item[] }>({
    happy: [],
    bad: [],
  });
  const [loading, setLoading] = React.useState<boolean>(false);

  /* URL → フォーム同期 */
  React.useEffect(() => {
    setQuery(qParam);
    setType(typeParam);
    setGenderFilter(genderParam); // 性別フィルターも同期
  }, [qParam, typeParam, genderParam]); // 依存配列にgenderParamを追加

  /* URL 変更時にデータ再取得 */
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      let targetUids: string[] | null = null;
      if (genderFilter !== "all") {
        // 性別フィルターが指定されている場合、UserテーブルからUIDを取得
        const { data: usersData, error: usersError } = await supabase
          .from("User")
          .select("uid")
          .eq("gender", genderFilter); // 'gender' カラムでフィルタリング

        if (usersError) {
          console.error("ユーザー取得エラー (性別フィルタ):", usersError);
          setItems({ happy: [], bad: [] });
          setLoading(false);
          return;
        }
        targetUids = (usersData || []).map((u) => u.uid);

        // 該当するUIDがない場合、そこで処理を終了
        if (targetUids.length === 0) {
          setItems({ happy: [], bad: [] });
          setLoading(false);
          return;
        }
      }

      /* ① Action 取得（フィルタ適用） */
      let q = supabase
        .from("Action")
        .select("aid, action_name, happiness_change, uid"); // uid も選択する

      if (qParam) q = q.ilike("action_name", `%${qParam}%`);
      if (typeParam === "positive") q = q.gt("happiness_change", 0);
      if (typeParam === "negative") q = q.lt("happiness_change", 0);

      // 性別フィルターが適用されている場合、in クエリで絞り込む
      if (targetUids !== null) {
        q = q.in("uid", targetUids);
      }

      const { data: actions = [] } = await q;

      /* ② Like 行を取得して集計 */
      const aidList = (actions ?? []).map((a) => a.aid);
      const { data: likeRows = [] } = await supabase
        .from("Like")
        .select("aid, uid")
        .in("aid", aidList);

      const likeMap: Record<number, number> = {};
      (likeRows ?? []).forEach(
        (r) => (likeMap[r.aid] = (likeMap[r.aid] ?? 0) + 1)
      );

      /* ログインユーザの liked セット */
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id;
      const likedSet = new Set<number>();
      if (uid)
        (likeRows ?? []).forEach((r) => {
          if (r.uid === uid) likedSet.add(r.aid);
        });

      /* ③ 整形・振り分け */
      const all: Item[] = (actions ?? []).map((a: any) => ({
        id: a.aid,
        label: a.action_name,
        weight: a.happiness_change,
        like_count: likeMap[a.aid] ?? 0,
        liked: likedSet.has(a.aid),
        isHappy: a.happiness_change > 0,
      }));

      setItems({
        happy: all
          .filter((i) => i.isHappy)
          .sort((a, b) => b.like_count - a.like_count),
        bad: all
          .filter((i) => !i.isHappy)
          .sort((a, b) => b.like_count - a.like_count),
      });

      setLoading(false);
    };

    fetchData();
  }, [qParam, typeParam, genderFilter]); // 依存配列にgenderFilterを追加

  /* URL 書き換えだけで "検索" */
  const router = useRouter();
  const runSearch = () => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (type) p.set("type", type);
    if (genderFilter !== "all") p.set("gender", genderFilter); // 性別フィルターもURLに反映
    router.push(`/search${p.size ? `?${p.toString()}` : ""}`);
  };

  /* いいね／いいね解除 */
  const toggleLike = async (aid: number, liked: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインしてください");
      return;
    }

    /* 楽観的更新 */
    setItems((prev) => {
      const upd = (arr: Item[]) =>
        arr.map((i) =>
          i.id === aid
            ? {
                ...i,
                liked: !liked,
                like_count: i.like_count + (liked ? -1 : 1),
              }
            : i
        );
      return { happy: upd(prev.happy), bad: upd(prev.bad) };
    });

    if (liked) {
      await supabase.from("Like").delete().eq("uid", user.id).eq("aid", aid);
    } else {
      await supabase.from("Like").insert({ uid: user.id, aid });
    }
  };

  /* カード描画 */
  const renderCard = (i: Item) => (
    <li
      key={i.id}
      className="text-black border rounded-lg p-4 flex justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <p className="text-lg font-medium text-black truncate azuki-font">{i.label}</p>
        <p className={`text-sm azuki-font ${i.weight > 0 ? "text-fuchsia-700" : "text-blue-700"}`}>
          幸福度: {i.weight > 0 ? "+" : ""}
          {i.weight}
        </p>
      </div>

      <button
        onClick={() => toggleLike(i.id, i.liked)}
        className="flex items-center gap-1 focus:outline-none ml-4 flex-shrink-0"
      >
        <span className={i.isHappy ? "text-red-700" : "text-blue-700"}>
          {i.isHappy ? (i.liked ? "❤️" : "🤍") : i.liked ? "💙" : "🤍"}
        </span>
        <span className="text-sm azuki-font">{i.like_count}</span>
      </button>
    </li>
  );

  /*─────────────────────*
   * JSX
   *─────────────────────*/
  return (
    <section className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 pb-96 sm:pb-64 min-h-[calc(100vh-200px)]">
      {/* ── 検索バー ─────────────────── */}
      <div className="flex gap-2 bg-white p-4 rounded border sticky top-4 z-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード検索"
          className="flex-1 border rounded px-3 py-2 bg-white text-black"
        />
        <button
          onClick={runSearch}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded whitespace-nowrap"
        >
          検索
        </button>
      </div>

      {/* ── 感情ソートボタン ─────────────────── */}
      <div className="flex gap-2 text-lg mb-2">
        <button
          onClick={() => {
            setActiveSection("happy");
            // Set type to "positive" when "嬉しい" is clicked, and update URL
            const p = new URLSearchParams(searchParams.toString());
            p.set("type", "positive");
            router.push(`/search?${p.toString()}`);
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold p-3 rounded-lg border shadow-sm transition-colors ${
            type === "positive" ? "bg-fuchsia-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-black">嬉しい</span>
        </button>

        <button
          onClick={() => {
            setActiveSection("bad");
            // Set type to "negative" when "悲しい" is clicked, and update URL
            const p = new URLSearchParams(searchParams.toString());
            p.set("type", "negative");
            router.push(`/search?${p.toString()}`);
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold p-3 rounded-lg border shadow-sm transition-colors ${
            type === "negative" ? "bg-fuchsia-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <span className="text-2xl">💙</span>
          <span className="text-black">悲しい</span>
        </button>
        {/* New "全て" button for emotion filter */}
        <button
          onClick={() => {
            setActiveSection("all");
            // Remove type from URL
            const p = new URLSearchParams(searchParams.toString());
            p.delete("type");
            router.push(`/search?${p.toString()}`);
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold p-3 rounded-lg border shadow-sm transition-colors ${
            type === "" ? "bg-fuchsia-100" : "bg-white hover:bg-gray-50"
          }`}
        >
          <span className="text-2xl">🔄</span> {/* Or a suitable icon for "all" */}
          <span className="text-black">全て</span>
        </button>
      </div>

      {/* ── 性別フィルターボタン ─────────────────── */}
      <div className="flex gap-2 text-md mb-4 justify-center">
        <button
          onClick={() => {
            setGenderFilter("all");
            // URLパラメータも更新
            const p = new URLSearchParams(searchParams.toString());
            p.delete("gender");
            router.push(`/search?${p.toString()}`);
          }}
          className={`px-4 py-2 rounded-lg border shadow-sm transition-colors ${
            genderFilter === "all" ? "bg-gray-200" : "bg-white hover:bg-gray-50"
          } text-black font-medium`}
        >
          全て
        </button>
        <button
          onClick={() => {
            setGenderFilter("male");
            // URLパラメータも更新
            const p = new URLSearchParams(searchParams.toString());
            p.set("gender", "male");
            router.push(`/search?${p.toString()}`);
          }}
          className={`px-4 py-2 rounded-lg border shadow-sm transition-colors ${
            genderFilter === "male" ? "bg-blue-100" : "bg-white hover:bg-gray-50"
          } text-black font-medium`}
        >
          男性
        </button>
        <button
          onClick={() => {
            setGenderFilter("female");
            // URLパラメータも更新
            const p = new URLSearchParams(searchParams.toString());
            p.set("gender", "female");
            router.push(`/search?${p.toString()}`);
          }}
          className={`px-4 py-2 rounded-lg border shadow-sm transition-colors ${
            genderFilter === "female" ? "bg-pink-100" : "bg-white hover:bg-gray-50"
          } text-black font-medium`}
        >
          女性
        </button>
      </div>

      {/* ── 検索結果 ─────────────────── */}
      {loading ? (
        <p className="text-center text-black pt-8">読み込み中…</p>
      ) : items.happy.length + items.bad.length === 0 ? (
        <p className="text-black text-center pt-8">該当する項目がありません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Happyセクション */}
          {(activeSection === "all" || activeSection === "happy") && type !== "negative" && (
            <div className="space-y-4">
              <ul className="space-y-4">{items.happy.map(renderCard)}</ul>
            </div>
          )}
          {/* Badセクション */}
          {(activeSection === "all" || activeSection === "bad") && type !== "positive" && (
            <div className="space-y-4">
              <ul className="space-y-4">{items.bad.map(renderCard)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchClient;