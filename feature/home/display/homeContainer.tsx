import React from "react";
import HomeDisplay from "./homeDisplay";
import Footer from "@/components/display/Footer";

const HomeContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <HomeDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default HomeContainer;
