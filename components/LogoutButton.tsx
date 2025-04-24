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
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      ログアウト
    </button>
  );
}
