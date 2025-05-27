"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/useAuth";

const LoginDisplay: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { uid } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!uid) {
        throw new Error("ユーザー情報の取得に失敗しました");
      }

      // Userテーブルにユーザー情報があるか確認
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("uid", uid)
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      // ユーザー情報の有無に応じてリダイレクト先を変更
      if (userData) {
        router.push("/home");
      } else {
        router.push("/register");
      }

      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("SignUp attempt with email:", email); // デバッグログ
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log("SignUp response:", { data, error }); // デバッグログ

      if (error) {
        console.error("SignUp error:", error); // エラーログ
        throw error;
      }

      // 登録メール送信成功
      console.log("SignUp success, user:", data.user); // デバッグログ
      alert("確認メールを送信しました。メールをご確認ください。");
    } catch (err) {
      console.error("SignUp catch error:", err); // エラーログ
      setError(
        err instanceof Error ? err.message : "サインアップに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-black azuki-font">ログイン</h1>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-black azuki-font">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-black azuki-font"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-fuchsia-700 rounded-md hover:bg-fuchsia-800 disabled:bg-fuchsia-500"
          >
            {loading ? "処理中..." : "ログイン"}
          </button>

          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="text-xl text-fuchsia-700 hover:underline azuki-font"
            >
              初回アカウント登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginDisplay;
