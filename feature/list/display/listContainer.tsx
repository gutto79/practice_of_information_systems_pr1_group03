"use client";

import React, { useState } from "react";
import ListDisplay from "./listDisplay";
import Footer from "@/components/display/Footer";

const ListContainer: React.FC = () => {
  
  const [message, setMessage] = useState("テスト1");

  const handleClick = () => {
    setMessage("ボタンがクリックされました。");
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">

        <div className="flex justify-center">
          <img src="/heartMark.png" alt="ハートの画像" className="w-64 h-auto rounded-lg shadow-lg" />
        </div>

        {/* メッセージ表示 */}
        <p className="text-center text-lg">{message}</p>

        <div className="flex justify-center">
            <button
              onClick={handleClick}
              className="bg-blue-600 text_red px-6 py-2 rounded hover:bg-blue-700 transition"
            >
            押してみて。
            </button>       
          </div>

        <ListDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default ListContainer;
