"use client";  // 添加这个指令
import React from "react";

// HomeDisplay.tsx 中展示结构（条件渲染）
const HomeDisplay = () => {
  const hasPartner = false; // TODO
    const [inviteId, setInviteId] = React.useState('');


    if (!hasPartner) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
                <p className="text-xl mb-6">招待しょう！</p>

                <input
                    type="text"
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                    placeholder="IDを入力"
                    className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-xs"
                />

                <button
                    onClick={() => alert(`ID ${inviteId} に招待を送りました！`)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded"
                >
                    招待
                </button>
            </div>
        );
    }

    return (
        <div className="relative p-6 h-screen">
            {/* 幸福度 */}
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2>相手の幸福度</h2>
                    <div className="text-4xl font-bold">85%</div>
                </div>
            </div>

            {/* 自己的幸福度 - 修改后的版本 */}
            <div className="absolute top-4 right-4 text-right"> {/* 新增 text-right */}
                <div className="text-sm text-gray-600">自分の幸福度</div> {/* 缩小为 text-sm */}
                <div className="text-xl font-bold text-gray-600">75%</div> {/* 缩小为 text-xl */}
            </div>

            <div className="fixed bottom-20 left-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg">
                    ▶️
                </button>
            </div>
        </div>
    );
};


export default HomeDisplay;
