"use client";

import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // セッションを破棄
    await supabase.auth.signOut();

    // ページをリフレッシュしてミドルウェアに再評価させる
    router.refresh();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex-1 px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 border border-gray-300 shadow whitespace-nowrap text-sm"
    >
      ログアウト
    </button>
  );
}
