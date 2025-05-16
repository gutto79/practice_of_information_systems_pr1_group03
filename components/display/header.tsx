"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/hooks/useAuth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";

export default function Header() {
  const { uid, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [happiness, setHappiness] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;

      try {
        // ユーザープロファイルを取得
        const { data, error } = await supabase
          .from("User")
          .select("name, gender, happiness")
          .eq("uid", uid)
          .single();

        if (error) throw error;

        if (data) {
          setUsername(data.name || "");
          setGender(data.gender || "");
          setHappiness(data.happiness || 0);
        }
      } catch (error) {
        console.error("プロファイル取得エラー:", error);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [uid, authLoading]);

  // プロファイル更新処理
  const handleSaveProfile = async () => {
    if (!uid) {
      setMessage({ text: "ユーザーが認証されていません", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const { error } = await supabase.from("User").upsert({
        uid: uid,
        name: username,
        gender: gender,
        happiness: happiness, // 既存のhappiness値をそのまま使用
      });

      if (error) throw error;

      setMessage({ text: "プロファイルを更新しました", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("プロファイル更新エラー:", error);
      setMessage({ text: "更新に失敗しました", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-fuchsia-700 border-b border-fuchsia-800 shadow-sm">
      <div className="container flex items-center justify-center h-16 px-4 mx-auto relative">
        <h1 className="text-xl font-bold text-white">幸福度可視化</h1>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <div className="absolute right-4">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-white text-fuchsia-700 border-white hover:bg-fuchsia-100 hover:text-fuchsia-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="sr-only">設定</span>
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-72 bg-white" align="end">
            <div className="grid gap-4">
              <div className="font-medium text-lg">ユーザー設定</div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    ユーザー名
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="ユーザー名を入力"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">性別</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        className="w-4 h-4 text-fuchsia-700"
                        checked={gender === "male"}
                        onChange={() => setGender("male")}
                      />
                      <span>男性</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        className="w-4 h-4 text-fuchsia-700"
                        checked={gender === "female"}
                        onChange={() => setGender("female")}
                      />
                      <span>女性</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        className="w-4 h-4 text-fuchsia-700"
                        checked={gender === "other"}
                        onChange={() => setGender("other")}
                      />
                      <span>その他</span>
                    </label>
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`text-sm ${
                      message.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  className="w-full px-4 py-2 text-white bg-fuchsia-700 rounded-md hover:bg-fuchsia-800 disabled:bg-fuchsia-500"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? "保存中..." : "保存"}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <LogoutButton />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
