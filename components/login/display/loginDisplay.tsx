"use client";

import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";

// 初回登録用モーダルコンポーネント
const SignUpModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string) => Promise<void>;
}> = ({ isOpen, onClose, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSignUp(email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-center">初回アカウント登録</h3>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="modal-email" className="block mb-1 text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="modal-password" className="block mb-1 text-sm font-medium">
              パスワード
            </label>
            <input
              id="modal-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-fuchsia-700 rounded-md hover:bg-fuchsia-800 disabled:bg-fuchsia-500"
            >
              {loading ? "処理中..." : "登録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoginDisplay: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      // 認証データが存在することを確認
      if (!authData?.user?.id) {
        throw new Error("認証情報の取得に失敗しました");
      }

      const userId = authData.user.id;

      // Userテーブルにユーザー情報があるか確認
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("*")
        .eq("uid", userId)
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

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
          }
        },
      });

      if (error) {
        console.error("SignUp error:", error);
        throw error;
      }

      if (data?.user) {
        alert("確認メールを送信しました。メールをご確認ください。");
      } else {
        throw new Error("ユーザー登録に失敗しました");
      }
    } catch (err) {
      console.error("SignUp catch error:", err);
      throw err;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold azuki-font px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg border border-white/30 mb-8">
        <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] relative">
          <span className="absolute inset-0 bg-white/30 blur-sm opacity-70 animate-pulse rounded-full"></span>
          HapiViz
        </span>
      </h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-black azuki-font">
          ログイン
        </h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-medium text-black azuki-font"
            >
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
              onClick={() => setShowSignUpModal(true)}
              disabled={loading}
              className="text-xl text-fuchsia-700 hover:underline azuki-font"
            >
              初回アカウント登録
            </button>
          </div>
        </form>
      </div>

      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSignUp={handleSignUp}
      />
    </div>
  );
};

export default LoginDisplay;
