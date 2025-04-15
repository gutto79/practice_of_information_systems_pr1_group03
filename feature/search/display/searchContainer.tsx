import React from "react";
import SearchDisplay from "./searchDisplay";
import Footer from "@/components/display/Footer";

const SearchContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <SearchDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default SearchContainer;
