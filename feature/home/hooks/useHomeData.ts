import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeState, Invite, TimeRange } from "../types/types";
import * as homeService from "../services/homeService";

/**
 * ホーム画面のデータと機能を管理するカスタムフック
 */
export const useHomeData = () => {
  // 状態の初期化
  const [state, setState] = useState<HomeState>({
    hasPartner: false,
    inviteId: "",
    userHappiness: null,
    partnerHappiness: null,
    loading: true,
    partnerId: null,
    userGender: null,
    partnerGender: null,
    pendingInvites: [],
    sentInvites: [],
    user: null,
    userName: null,
    partnerName: null,
    recentActions: [],
    showTimeModal: false,
    selectedTimeRange: "1日",
    showBreakupModal: false,
    showToast: false,
    toastMessage: "",
    videoUrl: null,
  });

  const router = useRouter();

  // 状態を更新する関数
  const updateState = (newState: Partial<HomeState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  // トースト表示関数
  const showToastMessage = (message: string) => {
    updateState({
      showToast: true,
      toastMessage: message,
    });
    setTimeout(() => updateState({ showToast: false }), 2000);
  };

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await homeService.getCurrentUser();
        if (!data.user) {
          router.push("/");
        }
      } catch (error) {
        console.error("認証チェックエラー:", error);
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  // ユーザーデータの取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 現在のユーザー取得
        const { data } = await homeService.getCurrentUser();
        if (!data.user) {
          throw new Error("ユーザーが見つかりません");
        }

        updateState({ user: { id: data.user.id } });

        // ユーザー詳細情報取得
        const userData = await homeService.getUserDetails(data.user.id);
        updateState({
          userHappiness: userData.happiness,
          userGender: userData.gender,
          userName: userData.name,
        });

        // カップル関係確認
        const coupleData = await homeService.getCoupleRelationship(
          data.user.id
        );

        if (coupleData) {
          // パートナーIDの特定
          const partnerId =
            coupleData.uid1 === data.user.id
              ? coupleData.uid2
              : coupleData.uid1;

          // パートナー情報取得
          const partnerData = await homeService.getUserDetails(partnerId);

          updateState({
            hasPartner: true,
            partnerId,
            partnerHappiness: partnerData.happiness,
            partnerGender: partnerData.gender,
            partnerName: partnerData.name,
          });
        } else {
          updateState({
            hasPartner: false,
            partnerId: null,
            partnerHappiness: null,
            partnerGender: null,
            partnerName: null,
          });
        }

        // 最近のアクション取得
        const recentActions = await homeService.getRecentActions(data.user.id);
        updateState({ recentActions });

        // 受け取った招待取得
        const pendingInvites = await homeService.getPendingInvites(
          data.user.id
        );
        updateState({ pendingInvites });

        // 送信した招待取得
        const sentInvites = await homeService.getSentInvites(data.user.id);
        updateState({ sentInvites });
      } catch (error) {
        console.error("データ取得エラー:", error);
        showToastMessage("データの取得に失敗しました");
      } finally {
        updateState({ loading: false });
      }
    };

    fetchUserData();
  }, [router]);

  // 招待送信
  const handleSendInvite = async (inviteId: string) => {
    try {
      if (!inviteId) {
        showToastMessage("IDを入力してください");
        return;
      }

      if (inviteId === state.partnerId || inviteId === state.user?.id) {
        showToastMessage("自分自身や既に配对的用户を招待できません");
        return;
      }

      const { newInvite, targetUser } = await homeService.sendInvite(
        state.user?.id as string,
        inviteId
      );

      showToastMessage("招待を送りました！");

      // 送信済み招待リスト更新
      updateState({
        sentInvites: [
          {
            ...newInvite,
            to_user: targetUser,
          },
          ...state.sentInvites,
        ],
        inviteId: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        showToastMessage(error.message);
      } else {
        showToastMessage("招待に失敗しました");
      }
    }
  };

  // IDコピー
  const handleCopyId = () => {
    if (state.user?.id) {
      navigator.clipboard.writeText(state.user.id);
      showToastMessage("IDをコピーしました！");
    }
  };

  // 招待承諾
  const handleAcceptInvite = async (invite: Invite) => {
    try {
      const partnerData = await homeService.acceptInvite(invite);

      // 状態更新
      updateState({
        hasPartner: true,
        partnerId: invite.from_uid,
        partnerHappiness: partnerData.happiness,
        partnerGender: partnerData.gender,
        partnerName: partnerData.name,
        pendingInvites: state.pendingInvites.filter((i) => i.id !== invite.id),
        sentInvites: [],
      });

      showToastMessage("ペアリング成功！");
    } catch (error) {
      if (error instanceof Error) {
        showToastMessage(error.message);
      } else {
        showToastMessage("ペアリングに失敗しました");
      }
    }
  };

  // 招待拒否
  const handleDeclineInvite = async (invite: Invite) => {
    try {
      await homeService.declineInvite(invite.id);
      updateState({
        pendingInvites: state.pendingInvites.filter((i) => i.id !== invite.id),
      });
    } catch {
      showToastMessage("招待の拒否に失敗しました");
    }
  };

  // 招待削除
  const handleDeleteInvite = async (inviteId: number) => {
    try {
      await homeService.deleteInvite(inviteId);
      updateState({
        sentInvites: state.sentInvites.filter((i) => i.id !== inviteId),
      });
    } catch (error) {
      if (error instanceof Error) {
        showToastMessage(error.message);
      }
    }
  };

  // パートナー解除
  const handleBreakup = async () => {
    try {
      if (!state.partnerId || !state.user) return;

      await homeService.breakupCouple(state.user.id, state.partnerId);
      window.location.reload(); // 画面リロード
    } catch {
      showToastMessage("パートナー解除に失敗しました");
    }
  };

  // 時間範囲選択
  const handleSelectTimeRange = (range: TimeRange) => {
    updateState({ selectedTimeRange: range });
  };

  interface MovieResponse {
    success: boolean;
    message: string;
    note?: string;
    video_url?: string;
  }

  // 動画生成
  const handleGenerateMovie = async () => {
    try {
      showToastMessage("動画生成中...");

      // 日数設定
      let days = 1;
      if (state.selectedTimeRange === "1週間") {
        days = 7;
      } else if (state.selectedTimeRange === "1ヶ月") {
        days = 30;
      }
      //開発段階では動画生成を行わない
      //const responseData = await homeService.generateMovie(
      //  state.user?.id as string,
      //  days
      //);

      const responseData = await homeService.getMovie() as MovieResponse;

      // 開発モードの場合は注意書きを表示
      if (responseData.note) {
        showToastMessage(responseData.message);
        // 3秒後に注意書きを表示
        setTimeout(() => {
          showToastMessage(responseData.note || "");
        }, 3000);
      } else {
        showToastMessage("動画が生成されました！");
      }
    } catch (error) {
      if (error instanceof Error) {
        showToastMessage(error.message);
      } else {
        showToastMessage("動画生成に失敗しました");
      }
    }
  };

  // 動画取得
  const handleGetMovie = async () => {
    try {
      const response = await homeService.getMovie();
      if (response.video_url) {
        updateState({ videoUrl: response.video_url });
        showToastMessage("動画を取得しました！");
      } else {
        throw new Error("動画のURLを取得できませんでした");
      }
    } catch (error) {
      if (error instanceof Error) {
        showToastMessage(error.message);
      } else {
        showToastMessage("動画の取得に失敗しました");
      }
    }
  };

  return {
    ...state,
    showToastMessage,
    handleSendInvite,
    handleCopyId,
    handleAcceptInvite,
    handleDeclineInvite,
    handleDeleteInvite,
    handleBreakup,
    handleSelectTimeRange,
    handleGenerateMovie,
    setShowTimeModal: (show: boolean) => updateState({ showTimeModal: show }),
    setShowBreakupModal: (show: boolean) =>
      updateState({ showBreakupModal: show }),
    setInviteId: (id: string) => updateState({ inviteId: id }),
    handleGetMovie,
    setVideoUrl: (url: string | null) => updateState({ videoUrl: url }),
  };
};
