/*───────────────────────────────────────────────*/
/*  feature/search/display/SearchPage.tsx        */
/*───────────────────────────────────────────────*/
import SearchClient from './SearchClient';

type Params = { q?: string; type?: 'positive' | 'negative' };
interface Props { searchParams?: Params }

export default function SearchPage({ searchParams = {} }: Props) {
  const { q = '', type = '' } = searchParams;

  /* サーバー側では DB を触らず、初期値だけ渡す */
  return (
    <SearchClient
      initialQuery={q}
      initialType={type as '' | 'positive' | 'negative'}
    />
  );
}
