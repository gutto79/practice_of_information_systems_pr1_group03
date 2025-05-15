import React from "react";

type ItemType = {
  id: number;
  name: string;
  point: number;
  type: string;
  category: string;
};

const ListDisplay: React.FC<{ items: ItemType[] }> = ({ items }) => {
  if (items.length === 0) {
    return <p className="text-center">アイテムがありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="border rounded p-2 flex justify-between items-center"
        >
          <span>{item.name}</span>
          <span>{item.point}pt</span>
        </li>
      ))}
    </ul>
  );
};

export default ListDisplay;