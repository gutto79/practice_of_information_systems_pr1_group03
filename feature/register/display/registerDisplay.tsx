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
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">ユーザー登録</h1>

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
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="回答しない">回答しない</option>
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
