"use client";

import React from "react";
import { HeartContainer } from "@/feature/home/components/UserStatus";

interface HappinessChangeModalProps {
  itemName: string;
  happinessChange: number;
  newHappiness: number;
  userName: string;
  partnerName: string;
  onClose: () => void;
}

/**
 * 幸福度変化表示モーダルコンポーネント
 */
const HappinessChangeModal: React.FC<HappinessChangeModalProps> = ({
  happinessChange,
  newHappiness,
  userName,
  partnerName,
}) => {
  const isPositive = happinessChange > 0;
  const absChange = Math.abs(happinessChange);
  const changeText = isPositive ? "増加" : "減少";

  // 幸福度の変化に応じたスタイルとアニメーション
  const getChangeStyle = () => {
    if (isPositive) {
      return "text-pink-500 animate-bounce";
    } else {
      return "text-blue-500 animate-pulse";
    }
  };

  // 幸福度の状態に応じたメッセージとスタイル
  const getStatusMessage = () => {
    if (newHappiness === 0) {
      return (
        <div className="mt-4 p-3 bg-gray-200 text-red-600 rounded-lg animate-pulse">
          幸福度が最低になりました...
          <br />
          {partnerName}との付き合い方を一度見直してみてはいかがでしょうか...?
        </div>
      );
    } else if (newHappiness === 100) {
      return (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-600 rounded-lg animate-bounce">
          幸福度が最高になりました！
          <br />
          {partnerName}は最高のパートナーですね！
        </div>
      );
    }
    return null;
  };

  // 幸福度ハート
  const getHappinessHeart = () => {
    return (
      <div className="flex justify-center my-6">
        <HeartContainer
          happiness={newHappiness}
          gender={null}
          size="large"
          animate={true}
        />
      </div>
    );
  };

  return (
    <div className="p-6 text-center">
      <div className="my-6 text-2xl font-bold">
        <span className={getChangeStyle()}>
          {userName}の幸福度が
          <br />
          {absChange}
          {changeText}しました
          {isPositive ? "!😊" : "...😔"}
        </span>
      </div>

      {getHappinessHeart()}
      <div className="my-6 text-2xl font-bold">現在の幸福度</div>

      {getStatusMessage()}
    </div>
  );
};

export default HappinessChangeModal;
