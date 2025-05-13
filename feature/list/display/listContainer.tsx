"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import ListDisplay from "./listDisplay";
import Footer from "@/components/display/Footer";

type ItemType = {
  id: number;
  name: string;
  point: number;
  type: string;
  category: string;
};

const ListContainer: React.FC = () => {
  const [name, setName] = useState("");
  const [point, setPoint] = useState<number>(0);
  const [items, setItems] = useState<ItemType[]>([]);
  const [currentType, setCurrentType] = useState("type1");
  const [currentCategory, setCurrentCategory] = useState("cat1");

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("type", currentType)
      .eq("category", currentCategory)
      .order("id", { ascending: false });

    if (!error && data) {
      setItems(data);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentType, currentCategory]);

  const handleSubmit = async () => {
    if (!name || point <= 0) return;

    const { error } = await supabase.from("items").insert([
      {
        name,
        point,
        type: currentType,
        category: currentCategory,
      },
    ]);

    if (!error) {
      setName("");
      setPoint(0);
      fetchItems();
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-4">
      <div className="flex-1">
        {/* 入力フォーム */}
        <div className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            placeholder="ポイント"
            value={point}
            onChange={(e) => setPoint(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            登録
          </button>
        </div>

        {/* 大枠ボタン */}
        <div className="flex flex-col gap-4 mb-4">
          {[
            { key: "type1", label: "彼氏" },
            { key: "type2", label: "彼女" },
          ].map((type) => (
            <button
              key={type.key}
              className={`text-5xl px-6 py-3 min-w-[250px] min-h-[100px] rounded font-semibold ${
                currentType === type.key ? "bg-green-600 text-white" : "bg-gray-300"
              }`}
              onClick={() => setCurrentType(type.key)}
            >
              {type.label} 
            </button>
          ))}
        </div>

        {/* リストA (ライクリスト) と リストB (サードリスト) を横並び */}
        <div className="flex gap-7 mb-6">
          {[
            { key: "likeList", label: "ライクリスト" },
            { key: "sadList", label: "サードリスト" },
          ].map((cat) => (
            <button
              key={cat.key}
              className={`text-3xl px-6 py-3 min-w-[475px] min-h-[100px] rounded font-semibold ${
                currentCategory === cat.key ? "bg-yellow-600 text-white" : "bg-gray-300"
              }`}
              onClick={() => setCurrentCategory(cat.key)}
            >
              {cat.label} 
            </button>
          ))}
        </div>

        {/* アイテムリスト表示 */}
        <ListDisplay items={items} />
      </div>
      <Footer />
    </div>
  );
};

export default ListContainer;