import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as listService from "../services/listService";
import { ItemType } from "../types/types";

// 日本時間のISO文字列を取得する関数
const getJstIsoString = (): string => {
  const date = new Date();
  // UTC時間に9時間を足して日本時間にする
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  // ISO形式の文字列を作り、末尾の「Z」を取り除く
  // 例: "2025-05-20T15:00:00.000"（日本時間）
  return jstDate.toISOString().replace("Z", "");
};

interface UseListReturn {
  items: ItemType[];
  showForm: boolean;
  actionName: string;
  happinessChange: number | null;
  isShowingPartnerList: boolean;
  myUid: string | null;
  partnerUid: string | null;
  listType: "like" | "sad";
  loading: boolean;
  dataLoading: boolean;
  editingItemId: number | null;
  confirmingItem: ItemType | null;
  myName: string;
  partnerName: string;

  setActionName: (name: string) => void;
  setHappinessChange: (value: number | null) => void;
  setShowForm: (show: boolean) => void;
  setIsShowingPartnerList: (show: boolean) => void;
  setListType: (type: "like" | "sad") => void;
  setConfirmingItem: (item: ItemType | null) => void;
  setEditingItemId: (id: number | null) => void;

  startEdit: (item: ItemType) => void;
  cancelForm: () => void;
  handleConfirmYes: () => Promise<{
    happinessChange: number;
    itemName: string;
    newHappiness: number;
  } | null>;
  handleSubmit: () => Promise<void>;
}

export const useList = (): UseListReturn => {
  const [items, setItems] = useState<ItemType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [actionName, setActionName] = useState("");
  // happinessChange をスライダーの直接の値として使用 (-100 から 100)
  const [happinessChange, setHappinessChange] = useState<number | null>(null);

  const [isShowingPartnerList, setIsShowingPartnerList] = useState(false);
  const [myUid, setMyUid] = useState<string | null>(null);
  const [partnerUid, setPartnerUid] = useState<string | null>(null);
  const [listType, setListType] = useState<"like" | "sad">("like");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<ItemType | null>(null);
  const [myName, setMyName] = useState("あなた");
  const [partnerName, setPartnerName] = useState("パートナー");

  const { uid } = useAuth();

  // コンポーネントロード時やフォーム表示時の初期化
  useEffect(() => {
    if (happinessChange === null) {
      // フォーム表示時の初期値として、例えば1を設定（0は登録不可のため）
      setHappinessChange(1);
    }
  }, [happinessChange]);

  // uidが変更されたらmyUidを更新
  useEffect(() => {
    if (uid) {
      setMyUid(uid);
    }
  }, [uid]);

  // myUidが変更されたらパートナーのuidと名前を取得
  useEffect(() => {
    const fetchPartnerUid = async () => {
      if (!myUid) return;

      console.log("Fetching partner info for myUid:", myUid);
      const partner = await listService.getCoupleRelationship(myUid);
      console.log("Partner UID:", partner);
      setPartnerUid(partner);

      try {
        // 名前を取得
        const names = await listService.getUserNames(myUid);
        console.log("Fetched names:", names);
        setMyName(names.myName || "あなた");
        setPartnerName(names.partnerName || "パートナー");
      } catch (error) {
        console.error("Error fetching names:", error);
        setMyName("あなた");
        setPartnerName("パートナー");
      }
    };

    fetchPartnerUid();
  }, [myUid]);

  // リストタイプ、表示対象、uidが変更されたらアクションを取得
  useEffect(() => {
    const fetchActions = async () => {
      setDataLoading(true);
      try {
        const targetUid = isShowingPartnerList ? partnerUid : myUid;
        const actions = await listService.getActions(targetUid, listType);
        setItems(actions);
      } catch (error) {
        console.error("Error fetching actions:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchActions();
  }, [listType, isShowingPartnerList, myUid, partnerUid]);

  // 編集開始
  const startEdit = (item: ItemType) => {
    setEditingItemId(item.id);
    setActionName(item.name);
    // 編集時は既存の happiness_change をそのまま設定
    setHappinessChange(item.originalHappinessChange);
    setShowForm(true);
  };

  // フォームキャンセル
  const cancelForm = () => {
    setShowForm(false);
    setEditingItemId(null);
    setActionName("");
    setHappinessChange(1); // フォームを閉じるときはデフォルト値（0以外）にリセット
  };

  // 確認ダイアログでYesを選択
  const handleConfirmYes = async () => {
    if (!confirmingItem || !myUid) return null;

    try {
      // ユーザーの現在の幸福度を取得
      const currentHappiness = await listService.getUserHappiness(myUid);

      if (currentHappiness === null) {
        return null;
      }

      // 新しい幸福度を計算
      let newHappiness =
        currentHappiness + confirmingItem.originalHappinessChange;
      if (newHappiness < 0) {
        newHappiness = 0;
      } else if (newHappiness > 100) {
        newHappiness = 100;
      }

      // 幸福度を更新
      await listService.updateUserHappiness(myUid, newHappiness);

      setConfirmingItem(null);

      // 幸福度の変化情報を返す
      return {
        happinessChange: confirmingItem.originalHappinessChange,
        itemName: confirmingItem.name,
        newHappiness: newHappiness,
      };
    } catch (error) {
      console.error("handleConfirmYes エラー:", error);
      return null;
    }
  };

  // フォーム送信
  const handleSubmit = async () => {
    if (
      !actionName ||
      happinessChange === null ||
      isNaN(happinessChange) ||
      myUid === null ||
      loading
    ) {
      alert("名前とポイントの両方を入力してください。");
      return;
    }

    // ポイントが0の場合は登録不可とするバリデーション
    if (happinessChange === 0) {
      alert("ポイントは0以外の値に設定してください。");
      return;
    }

    setLoading(true);

    try {
      if (editingItemId !== null) {
        // アクションを更新
        const success = await listService.updateAction(
          editingItemId,
          actionName,
          happinessChange
        );

        if (!success) {
          setLoading(false);
          return;
        }
      } else {
        // 新しいアクションを作成
        const actionId = await listService.createAction(
          myUid,
          actionName,
          happinessChange
        );

        if (actionId === null) {
          setLoading(false);
          return;
        }

        // カレンダーに追加
        const timestamp = getJstIsoString();
        await listService.addToCalendar(actionId, timestamp);
      }

      // フォームをリセットして、アクションを再取得
      cancelForm();
      const actions = await listService.getActions(myUid, listType);
      setItems(actions);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error("予期せぬエラー:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    showForm,
    actionName,
    happinessChange,
    isShowingPartnerList,
    myUid,
    partnerUid,
    listType,
    loading,
    dataLoading,
    editingItemId,
    confirmingItem,
    myName,
    partnerName,

    setActionName,
    setHappinessChange,
    setShowForm,
    setIsShowingPartnerList,
    setListType,
    setConfirmingItem,
    setEditingItemId,

    startEdit,
    cancelForm,
    handleConfirmYes,
    handleSubmit,
  };
};
