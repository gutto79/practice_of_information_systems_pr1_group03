// components/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

interface UseAuthReturn {
  uid: string | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = (): UseAuthReturn => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 初期ユーザー情報の取得
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (user) {
          setUid(user.id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("認証エラーが発生しました")
        );
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUid(session.user.id);
      } else {
        setUid(null);
      }
      setLoading(false);
    });

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { uid, loading, error };
};
