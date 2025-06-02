import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterType, Item, SearchProps } from "../types/types";
import * as searchService from "../services/searchService";

interface UseSearchReturn {
  query: string;
  type: FilterType;
  activeSection: "all" | "happy" | "bad";
  items: { happy: Item[]; bad: Item[] };
  loading: boolean;

  setQuery: (query: string) => void;
  setType: (type: FilterType) => void;
  setActiveSection: (section: "all" | "happy" | "bad") => void;

  runSearch: () => void;
  toggleLike: (aid: number, liked: boolean) => Promise<void>;
}

/**
 * 検索機能を管理するカスタムフック
 */
export const useSearch = ({
  initialQuery,
  initialType,
}: SearchProps): UseSearchReturn => {
  /* URL パラメータ */
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const typeParam = (searchParams.get("type") ?? "") as FilterType;

  /* フォーム state */
  const [query, setQuery] = useState<string>(initialQuery);
  const [type, setType] = useState<FilterType>(initialType);
  const [activeSection, setActiveSection] = useState<"all" | "happy" | "bad">(
    "happy"
  );

  /* 検索結果 state */
  const [items, setItems] = useState<{ happy: Item[]; bad: Item[] }>({
    happy: [],
    bad: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  /* URL → フォーム同期 */
  useEffect(() => {
    setQuery(qParam);
    setType(typeParam);
  }, [qParam, typeParam]);

  /* URL 変更時にデータ再取得 */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const results = await searchService.searchActions(qParam, typeParam);
      setItems(results);

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
  const handleToggleLike = async (aid: number, liked: boolean) => {
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

    try {
      const success = await searchService.toggleLike(aid, liked);
      if (!success) {
        // 失敗した場合は元に戻す
        setItems((prev) => {
          const upd = (arr: Item[]) =>
            arr.map((i) =>
              i.id === aid
                ? {
                    ...i,
                    liked: liked,
                    like_count: i.like_count + (liked ? 1 : -1),
                  }
                : i
            );
          return { happy: upd(prev.happy), bad: upd(prev.bad) };
        });

        alert("いいね処理に失敗しました");
      }
    } catch (error) {
      console.error("いいね処理エラー:", error);
      alert("いいね処理に失敗しました");
    }
  };

  return {
    query,
    type,
    activeSection,
    items,
    loading,

    setQuery,
    setType,
    setActiveSection,

    runSearch,
    toggleLike: handleToggleLike,
  };
};
