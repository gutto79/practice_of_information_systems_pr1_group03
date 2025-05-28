/*───────────────────────────────────────────────*/
/* feature/search/display/SearchClient.tsx      */
/*───────────────────────────────────────────────*/
"use client";

import React from "react";
import { useSearch } from "../hooks/useSearch";
import { Item, SearchProps } from "../types/types";

/*─────────────────────*
 * メインコンポーネント
 *─────────────────────*/
const SearchClient: React.FC<SearchProps> = ({ initialQuery, initialType }) => {
  const {
    query,
    type,
    activeSection,
    items,
    loading,

    setQuery,
    setActiveSection,

    runSearch,
    toggleLike,
  } = useSearch({ initialQuery, initialType });

  /* カード描画 */
  // ===== MODIFIED SECTION START =====
  const renderCard = (i: Item) => (
    <li
      key={i.id}
      className="text-black border rounded-lg p-4 flex justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-1 min-w-0">
        {/* 행동명 (i.label) 텍스트 크기를 text-lg로 변경 */}
        <p className="text-lg font-medium text-black truncate azuki-font">
          {i.label}
        </p>
        <p className="text-sm text-black azuki-font">
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
  // ===== MODIFIED SECTION END =====

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

      {/* ── ソートボタン ─────────────────── */}
      <div className="flex gap-2 text-lg mb-2">
        <button
          onClick={() =>
            setActiveSection(activeSection === "happy" ? "all" : "happy")
          }
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold p-3 rounded-lg border shadow-sm transition-colors ${
            activeSection === "happy"
              ? "bg-fuchsia-100"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <span className="text-2xl">❤️</span>
          <span className="text-black">嬉しい</span>
        </button>

        <button
          onClick={() =>
            setActiveSection(activeSection === "bad" ? "all" : "bad")
          }
          className={`flex-1 inline-flex items-center justify-center gap-2 font-bold p-3 rounded-lg border shadow-sm transition-colors ${
            activeSection === "bad"
              ? "bg-fuchsia-100"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          <span className="text-2xl">💙</span>
          <span className="text-black">悲しい</span>
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
          {(activeSection === "all" || activeSection === "happy") &&
            type !== "negative" && (
              <div className="space-y-4">
                <ul className="space-y-4">{items.happy.map(renderCard)}</ul>
              </div>
            )}
          {/* Badセクション */}
          {(activeSection === "all" || activeSection === "bad") &&
            type !== "positive" && (
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
