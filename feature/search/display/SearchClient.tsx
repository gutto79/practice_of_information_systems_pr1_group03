/*───────────────────────────────────────────────*/
/*  feature/search/display/SearchClient.tsx      */
/*───────────────────────────────────────────────*/
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

/* ---------- 型 ---------- */
type FilterType = '' | 'positive' | 'negative';
export interface Item {
  id: number;
  label: string;
  weight: number;
  like_count: number;
}
interface Props {
  initialQuery: string;
  initialType: FilterType;
}

/* ---------- Supabase（ブラウザ用） ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const SearchClient: React.FC<Props> = ({ initialQuery, initialType }) => {
  /* URL の現在値を監視 */
  const sp           = useSearchParams();
  const qFromUrl     = sp.get('q')    ?? '';
  const typeFromUrl  = (sp.get('type') ?? '') as FilterType;

  /* フォーム用 state */
  const [query, setQuery] = React.useState(initialQuery);
  const [type , setType ] = React.useState<FilterType>(initialType);

  /* 結果表示用 state */
  const [items  , setItems]   = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);

  /* URL が変わったらフォームも同期 */
  React.useEffect(() => {
    setQuery(qFromUrl);
    setType(typeFromUrl);
  }, [qFromUrl, typeFromUrl]);

  /* URL が変わったら Supabase から再取得 */
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      /* ------ Action の絞り込み ------ */
      let q = supabase
        .from('Action')
        .select('aid, action_name, happiness_change');

      if (qFromUrl)               q = q.ilike('action_name', `%${qFromUrl}%`);
      if (typeFromUrl === 'positive') q = q.gt('happiness_change', 0);
      if (typeFromUrl === 'negative') q = q.lt('happiness_change', 0);

      const { data: actions = [] } = await q;

      /* ------ Like 数を集計 ------ */
      const { data: likes = [] } = await supabase
        .from('Like')
        .select('aid');

      const likeMap: Record<number, number> = {};
      (likes ?? []).forEach(({ aid }) => (likeMap[aid] = (likeMap[aid] ?? 0) + 1));

      /* ------ 整形してセット ------ */
      const mapped: Item[] = (actions ?? []).map((a: any) => ({
        id   : a.aid,
        label: a.action_name,
        weight: a.happiness_change,
        like_count: likeMap[a.aid] ?? 0,
      }));

      setItems(mapped);
      setLoading(false);
    };

    fetchData();
  }, [qFromUrl, typeFromUrl]);

  /* 検索ボタン：URL だけ書き換える */
  const router = useRouter();
  const runSearch = () => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (type)  p.set('type', type);
    router.push(`/search${p.size ? `?${p.toString()}` : ''}`);
    /* router.refresh() は不要：useSearchParams が変われば自動で再フェッチ */
  };

  /* ---------- 画面 ---------- */
  return (
    <section className="space-y-4 max-w-3xl mx-auto p-6">
      {/* ── 検索バー ─────────────────── */}
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索"
          className="flex-1 border rounded px-3 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FilterType)}
          className="border rounded px-2 py-2"
        >
          <option value="">全部</option>
          <option value="positive">うれしい</option>
          <option value="negative">いやな</option>
        </select>
        <button
          onClick={runSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          検索
        </button>
      </div>

      {/* ── 検索結果 ───────────────── */}
      {loading ? (
        <p className="text-center text-gray-400 pt-8">読み込み中…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-center pt-8">該当する項目がありません</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {items.map(it => (
            <li
              key={it.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{it.label}</p>
                <p className="text-sm text-gray-500">
                  重み: {it.weight > 0 ? '+' : ''}{it.weight}
                </p>
              </div>
              <span className="flex items-center gap-1">
                {it.like_count > 0 ? '❤️' : '🤍'} {it.like_count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SearchClient;
