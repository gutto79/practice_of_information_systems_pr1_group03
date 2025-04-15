import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 py-4">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <Link href="/list" className="flex flex-col items-center">
          <span className="text-gray-600">リスト</span>
        </Link>
        <Link href="/home" className="flex flex-col items-center">
          <span className="text-gray-600">ホーム</span>
        </Link>
        <Link href="/calendar" className="flex flex-col items-center">
          <span className="text-gray-600">カレンダー</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center">
          <span className="text-gray-600">検索</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
