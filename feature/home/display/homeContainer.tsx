import React from "react";
import HomeDisplay from "./homeDisplay";
import Footer from "@/components/display/Footer";

const HomeContainer: React.FC = () => {
  return (
    <>
      <div className="flex flex-col w-full">
        <HomeDisplay />
      </div>
      <Footer />
    </>
  );
};

export default HomeContainer;
