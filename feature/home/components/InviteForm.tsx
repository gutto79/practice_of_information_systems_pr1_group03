import React, { useState } from "react";
import { Invite } from "../types/types";
import { styles } from "../utils/utils";

interface InviteFormProps {
  userId: string | undefined;
  onSendInvite: (inviteId: string) => Promise<void>;
  onCopyId: () => void;
  pendingInvites: Invite[];
  sentInvites: Invite[];
  onAcceptInvite: (invite: Invite) => Promise<void>;
  onDeclineInvite: (invite: Invite) => Promise<void>;
  onDeleteInvite: (inviteId: number) => Promise<void>;
}

/**
 * 招待フォームコンポーネント
 */
const InviteForm: React.FC<InviteFormProps> = ({
  userId,
  onSendInvite,
  onCopyId,
  pendingInvites,
  sentInvites,
  onAcceptInvite,
  onDeclineInvite,
  onDeleteInvite,
}) => {
  const [inviteId, setInviteId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) return;
    await onSendInvite(inviteId);
    setInviteId("");
  };

  return (
    <div className={styles.container}>
      {/* 受け取った招待 */}
      {pendingInvites.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow p-4 rounded z-50 min-w-[320px] w-full max-w-md">
          <div className="mb-2 text-gray-800">あなたへの招待：</div>
          {pendingInvites.map((invite) => (
            <div key={invite.id} className="flex items-center gap-2 mb-2">
              <span className="text-gray-800 flex-1">
                {invite.from_user?.name || "未知用户"} からの招待
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onAcceptInvite(invite)}
                  className={styles.button.primary}
                >
                  同意
                </button>
                <button
                  onClick={() => onDeclineInvite(invite)}
                  className={styles.button.secondary}
                >
                  拒否
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 招待フォーム */}
      <p className="text-xl mb-6 text-white">招待しょう！</p>
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <input
          type="text"
          value={inviteId}
          onChange={(e) => setInviteId(e.target.value)}
          placeholder="IDを入力"
          className={styles.input}
        />
        <button type="submit" className={styles.button.primary}>
          招待
        </button>
      </form>

      {/* ユーザーID表示 */}
      <div className="mt-4 text-white">
        <p className="text-sm mb-1">あなたのID：</p>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-sm rounded px-3 py-2 text-center flex-1">
            <span className="font-mono">{userId || "読み込み中..."}</span>
          </div>
          <button
            onClick={onCopyId}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded p-2 transition-colors"
            title="IDをコピー"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 送信済み招待 */}
      {sentInvites.length > 0 && (
        <div className="mt-6 w-full max-w-xs text-left">
          <div className="mb-2 text-sm text-white">あなたが送った招待：</div>
          {sentInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center gap-2 mb-2 text-xs"
            >
              <div className="flex-1">
                <span className="text-white">
                  → {invite.to_user?.name || "未知用户"}
                </span>
                <span
                  className={
                    invite.status === "pending"
                      ? "text-yellow-300"
                      : invite.status === "accepted"
                      ? "text-green-300"
                      : "text-gray-300"
                  }
                >
                  {invite.status === "pending" && " 待機中"}
                  {invite.status === "accepted" && " 同意された"}
                  {invite.status === "declined" && " 拒否された"}
                </span>
              </div>
              {invite.status === "declined" && (
                <button
                  onClick={() => onDeleteInvite(invite.id)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                >
                  了解
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InviteForm;
