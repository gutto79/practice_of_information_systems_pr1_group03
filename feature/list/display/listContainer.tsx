"use client";

import React from "react";
import Header from "@/components/display/header";
import Footer from "@/components/display/Footer";
import ListDisplay from "./listDisplay";

const ListContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full relative">
      <Header />
      <div className="flex-1">
        <ListDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default ListContainer;
