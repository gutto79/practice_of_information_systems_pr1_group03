import React from "react";
import Link from "next/link";
import {
  getFooterHeight,
  getTouchTargetSize,
  getSafeAreaPadding,
} from "@/lib/styles/responsive";

const Footer: React.FC = () => {
  const footerStyle = {
    ...getFooterHeight(),
    ...getSafeAreaPadding(),
  };

  const linkStyle = {
    ...getTouchTargetSize(44),
  };

  return (
    <footer
      className="fixed bottom-0 w-full bg-white/80 backdrop-blur-sm border-t border-gray-200"
      style={footerStyle}
    >
      <nav className="flex justify-around items-center h-16">
        <Link
          href="/list"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-gray-600 text-sm">リスト</span>
        </Link>
        <Link
          href="/home"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-gray-600 text-sm">ホーム</span>
        </Link>
        <Link
          href="/calendar"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-gray-600 text-sm">カレンダー</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-gray-600 text-sm">検索</span>
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
