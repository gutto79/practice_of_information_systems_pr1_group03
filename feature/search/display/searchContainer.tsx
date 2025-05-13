// feature/search/display/searchContainer.tsx
import React from "react";
import SearchDisplay from "./SearchPage";
import Footer from "@/components/display/Footer";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const SearchContainer: React.FC<Props> = ({ searchParams = {} }) => {
  // searchParamsをSearchDisplayが期待する形式に変換
  const formattedSearchParams = {
    searchParams: {
      q: searchParams.q as string | undefined,
      type: searchParams.type as 'positive' | 'negative' | undefined
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        {/* URL の ?q=…&type=… をそのまま受け渡し */}
        <SearchDisplay {...formattedSearchParams} />
      </div>
      <Footer />
    </div>
  );
};

export default SearchContainer;
