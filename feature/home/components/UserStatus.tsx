import React from "react";
import { getBorderColor, getBarColor } from "../utils/utils";

interface UserStatusProps {
  happiness: number | null;
  gender: string | null;
  name: string | null;
  isPartner?: boolean;
}

/**
 * ユーザーまたはパートナーの幸福度を表示するコンポーネント
 */
const UserStatus: React.FC<UserStatusProps> = ({
  happiness,
  gender,
  name,
  isPartner = false,
}) => {
  return (
    <div className={isPartner ? "w-full max-w-xs" : "w-24"}>
      <div
        className={`text-white mb-1 ${
          isPartner ? "text-3xl text-center azuki-font" : "text-sm text-right azuki-font"
        }`}
      >
        {isPartner ? "相手の幸福度" : "自分の幸福度"}
      </div>
      <div
        className={`relative w-full h-${isPartner ? "6" : "5"} ${getBarColor(
          gender,
          "bg"
        )} rounded-full overflow-hidden ${getBorderColor(gender)}`}
      >
        <div
          className={`h-full ${getBarColor(
            gender,
            "gradient"
          )} rounded-full transition-all duration-${isPartner ? "700" : "500"}`}
          style={{ width: `${happiness ?? 0}%` }}
        ></div>
        {/* 百分比数字固定在进度条正中间 */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
          {happiness ?? 0}%
        </span>
      </div>
      <div
        className={`text-sm text-white mt-1 ${
          isPartner ? "text-xl text-center" : "text-right"
        }`}
      >
        {name || (isPartner ? "相手" : "自分")}
      </div>
    </div>
  );
};

export default UserStatus;
