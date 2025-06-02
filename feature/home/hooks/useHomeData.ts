import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeState, Invite } from "../types/types";
import * as homeService from "../services/homeService";
import { useAuth } from "@/hooks/useAuth";
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
    showBreakupModal: false,
    showToast: false,
    toastMessage: "",
  });

  const router = useRouter();
  const { uid } = useAuth();

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

  // ユーザーデータの取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        updateState({ loading: false });
        return;
      }

      try {
        updateState({ loading: true, user: { id: uid } });

        // ユーザー詳細情報取得
        const userData = await homeService.getUserDetails(uid as string);
        updateState({
          userHappiness: userData.happiness,
          userGender: userData.gender,
          userName: userData.name,
        });

        // カップル関係確認
        const coupleData = await homeService.getCoupleRelationship(
          uid as string
        );

        let partnerId = null;
        if (coupleData) {
          // パートナーIDの特定
          partnerId = coupleData.uid1 === uid ? coupleData.uid2 : coupleData.uid1;

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

        // 最近のアクション取得（交往对象）
        const recentActions = partnerId
          ? await homeService.getRecentActions(partnerId)
          : [];
        updateState({ recentActions });

        // 受け取った招待取得
        const pendingInvites = await homeService.getPendingInvites(
          uid as string
        );
        updateState({ pendingInvites });

        // 送信した招待取得
        const sentInvites = await homeService.getSentInvites(uid as string);
        updateState({ sentInvites });
      } catch (error) {
        console.error("データ取得エラー:", error);
        showToastMessage("データの取得に失敗しました");
      } finally {
        updateState({ loading: false });
      }
    };

    fetchUserData();
  }, [uid, router]);

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

  return {
    ...state,
    showToastMessage,
    handleSendInvite,
    handleCopyId,
    handleAcceptInvite,
    handleDeclineInvite,
    handleDeleteInvite,
    handleBreakup,
    setShowBreakupModal: (show: boolean) =>
      updateState({ showBreakupModal: show }),
    setInviteId: (id: string) => updateState({ inviteId: id }),
  };
};
