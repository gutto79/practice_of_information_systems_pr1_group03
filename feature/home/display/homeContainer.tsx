import React from "react";
import HomeDisplay from "./homeDisplay";
import Footer from "@/components/display/Footer";
import Header from "@/components/display/header";

const HomeContainer: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <HomeDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default HomeContainer;
