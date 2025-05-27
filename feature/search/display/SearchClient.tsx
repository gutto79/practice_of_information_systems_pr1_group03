/*───────────────────────────────────────────────*/
/*  feature/search/display/SearchClient.tsx      */
/*───────────────────────────────────────────────*/
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

/*─────────────────────*
 *  型宣言
 *─────────────────────*/
type FilterType = "" | "positive" | "negative";

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
 *  Supabase ブラウザクライアント
 *─────────────────────*/
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/*─────────────────────*
 *  メインコンポーネント
 *─────────────────────*/
const SearchClient: React.FC<Props> = ({ initialQuery, initialType }) => {
  /* URL パラメータ */
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const typeParam = (searchParams.get("type") ?? "") as FilterType;

  /* フォーム state */
  const [query, setQuery] = React.useState<string>(initialQuery);
  const [type, setType] = React.useState<FilterType>(initialType);

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
  }, [qParam, typeParam]);

  /* URL 変更時にデータ再取得 */
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      /* ① Action 取得（フィルタ適用） */
      let q = supabase
        .from("Action")
        .select("aid, action_name, happiness_change");

      if (qParam) q = q.ilike("action_name", `%${qParam}%`);
      if (typeParam === "positive") q = q.gt("happiness_change", 0);
      if (typeParam === "negative") q = q.lt("happiness_change", 0);

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
  }, [qParam, typeParam]);

  /* URL 書き換えだけで "検索" */
  const router = useRouter();
  const runSearch = () => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (type) p.set("type", type);
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
      className="text-black border rounded p-4 flex justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-black truncate">{i.label}</p>
        <p className="text-sm text-black">
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
        <span className="text-sm">{i.like_count}</span>
      </button>
    </li>
  );

  /*─────────────────────*
   *  JSX
   *─────────────────────*/
  return (
    <section className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      {/* ── 検索バー ─────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 bg-white p-4 rounded border text-black">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード検索"
          className="w-full border rounded px-3 py-2 bg-white"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FilterType)}
            className="border rounded px-2 py-2 bg-white flex-1"
          >
            <option value="">全部</option>
            <option value="positive">うれしい</option>
            <option value="negative">いやだ</option>
          </select>
          <button
            onClick={runSearch}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded whitespace-nowrap"
          >
            検索
          </button>
        </div>
      </div>

      
      {/* ── 検索結果 ─────────────────── */}
      {loading ? (
        <p className="text-center text-black pt-8">読み込み中…</p>
      ) : items.happy.length + items.bad.length === 0 ? (
        <p className="text-black text-center pt-8">該当する項目がありません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Happyセクション - ネガティブフィルター時は非表示 */}
          {type !== "negative" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black sm:hidden flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-2xl">❤️</span>
                Happy
              </h2>
              <ul className="space-y-4">{items.happy.map(renderCard)}</ul>
            </div>
          )}
          {/* Badセクション - ポジティブフィルター時は非表示 */}
          {type !== "positive" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-black sm:hidden flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                <span className="text-2xl">💙</span>
                Bad
              </h2>
              <ul className="space-y-4">{items.bad.map(renderCard)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchClient;
