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
      className="fixed bottom-0 w-full bg-fuchsia-700/95 backdrop-blur-sm border-t border-fuchsia-800"
      style={footerStyle}
    >
      <nav className="flex justify-around items-center h-16">
        <Link
          href="/list"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-sm">リスト</span>
        </Link>
        <Link
          href="/home"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-sm">ホーム</span>
        </Link>
        <Link
          href="/calendar"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-sm">カレンダー</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-sm">検索</span>
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
