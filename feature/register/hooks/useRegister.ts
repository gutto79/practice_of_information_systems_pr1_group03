import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import * as registerService from "../services/registerService";

interface UseRegisterReturn {
  name: string;
  gender: string;
  loading: boolean;
  error: string | null;

  setName: (name: string) => void;
  setGender: (gender: string) => void;

  handleRegister: (e: React.FormEvent) => Promise<void>;
}

/**
 * 登録機能を管理するカスタムフック
 */
export const useRegister = (): UseRegisterReturn => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { uid } = useAuth();

  /**
   * 登録処理を行う
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!uid) {
        throw new Error(
          "ユーザー情報が取得できませんでした。再度ログインしてください。"
        );
      }

      // ユーザー情報を登録
      await registerService.registerUser(uid, name, gender);

      // 登録成功後、ホーム画面に遷移
      router.push("/home");
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    gender,
    loading,
    error,

    setName,
    setGender,

    handleRegister,
  };
};
