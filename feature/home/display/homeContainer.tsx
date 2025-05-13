import React from "react";
import HomeDisplay from "./homeDisplay";
import Footer from "@/components/display/Footer";
import Header from "@/components/display/header";
const HomeContainer: React.FC = () => {
  return (
    <>
      <Header />
      <div className="flex flex-col w-full">
        <HomeDisplay />
      </div>
      <Footer />
    </>
  );
};

export default HomeContainer;
