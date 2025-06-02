"use client";
import React from "react";
import { useRegister } from "../hooks/useRegister";

const RegisterDisplay: React.FC = () => {
  const {
    name,
    gender,
    loading,
    error,

    setName,
    setGender,

    handleRegister,
  } = useRegister();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* ロゴを上部に大きく表示 */}
      <h1 className="text-4xl font-bold azuki-font px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-lg border border-white/30 mb-8">
        <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] relative">
          <span className="absolute inset-0 bg-white/30 blur-sm opacity-70 animate-pulse rounded-full"></span>
          HapiViz
        </span>
      </h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">ユーザー登録</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium">
              ユーザー名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ユーザー名"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block mb-1 text-sm font-medium">
              性別
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 text-white bg-fuchsia-700 rounded-md hover:bg-fuchsia-800 disabled:bg-fuchsia-500"
          >
            {loading ? "処理中..." : "登録する"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDisplay;
