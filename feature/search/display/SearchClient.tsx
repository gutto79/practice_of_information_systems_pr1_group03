/*───────────────────────────────────────────────*/
/* feature/search/display/SearchClient.tsx      */
/*───────────────────────────────────────────────*/
"use client";

import React from "react";
import { useSearch } from "../hooks/useSearch";
import { Item, SearchProps } from "../types/types";
import CenteredLoadingSpinner from "@/components/ui/centered-loading-spinner";

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
        <p className="text-lg font-medium text-black truncate azuki-font">
          {i.label}
        </p>
        <p className={`text-lg azuki-font ${i.isHappy ? "text-red-700" : "text-blue-700"}`}>
          幸福度: {i.weight > 0 ? "+" : ""}
          <span className="font-bold">{i.weight}</span>
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
    <section className="flex flex-col h-screen max-w-4xl mx-auto p-4 sm:p-6">
      {/* ── 検索バー ─────────────────── */}
      <div className="flex gap-2 bg-white p-4 rounded border sticky top-4 z-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード検索"
          className="flex-1 border rounded px-3 py-2 bg-white text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
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
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <CenteredLoadingSpinner />
        ) : items.happy.length + items.bad.length === 0 ? (
          <p className="text-black text-center pt-8">該当する項目がありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 h-[calc(100vh-16rem)] sm:h-[calc(100vh-16rem)]">
            {/* Happyセクション */}
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">
                {(activeSection === "all" || activeSection === "happy") &&
                  type !== "negative" && (
                    <ul className="space-y-4 pt-0">
                      {items.happy.map(renderCard)}
                    </ul>
                  )}
              </div>
            </div>
            {/* Badセクション */}
            <div className="h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2">
                {(activeSection === "all" || activeSection === "bad") &&
                  type !== "positive" && (
                    <ul className="space-y-4 pt-0">
                      {items.bad.map(renderCard)}
                    </ul>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchClient;
