"use client";

import React from "react";
import Link from "next/link";
import { usePartnerContext } from "@/hooks/usePartnerContext";
import {
  getFooterHeight,
  getTouchTargetSize,
  getSafeAreaPadding,
} from "@/lib/styles/responsive";

const Footer: React.FC = () => {
  const { hasPartner } = usePartnerContext();

  const footerStyle = {
    ...getFooterHeight(),
    ...getSafeAreaPadding(),
  };

  const linkStyle = {
    ...getTouchTargetSize(44),
  };

  return (
    <footer
      className="fixed bottom-0 z-50 w-full bg-fuchsia-700/95 backdrop-blur-sm border-t border-fuchsia-800 azuki-font"
      style={footerStyle}
    >
      <nav className="flex justify-around items-center h-16">
        {hasPartner ? (
          <Link
            href="/list"
            className="flex flex-col items-center justify-center"
            style={linkStyle}
          >
            <span className="text-white text-lg">リスト</span>
          </Link>
        ) : (
          <div
            className="flex flex-col items-center justify-center opacity-50 cursor-not-allowed"
            style={linkStyle}
          >
            <span className="text-white text-lg">リスト</span>
          </div>
        )}
        <Link
          href="/home"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-lg">ホーム</span>
        </Link>
        {hasPartner ? (
          <Link
            href="/calendar"
            className="flex flex-col items-center justify-center"
            style={linkStyle}
          >
            <span className="text-white text-lg">カレンダー</span>
          </Link>
        ) : (
          <div
            className="flex flex-col items-center justify-center opacity-50 cursor-not-allowed"
            style={linkStyle}
          >
            <span className="text-white text-lg">カレンダー</span>
          </div>
        )}
        <Link
          href="/search"
          className="flex flex-col items-center justify-center"
          style={linkStyle}
        >
          <span className="text-white text-lg">検索</span>
        </Link>
      </nav>
    </footer>
  );
};

export default Footer;
