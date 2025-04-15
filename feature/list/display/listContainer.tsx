import React from "react";
import ListDisplay from "./listDisplay";
import Footer from "@/components/display/Footer";

const ListContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <ListDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default ListContainer;
