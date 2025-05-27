import React, { useEffect, useState } from "react";
import { getBorderColor, getBarColor } from "../utils/utils";

interface UserStatusProps {
  happiness: number | null;
  gender: string | null;
  name: string | null;
  isPartner?: boolean;
}

const HeartContainer: React.FC<{ happiness: number; gender: string | null }> = ({ happiness, gender }) => {
  const [animatedHappiness, setAnimatedHappiness] = useState(0);

  useEffect(() => {
    // 重置动画状态
    setAnimatedHappiness(0);
    // 使用 requestAnimationFrame 实现平滑动画
    const startTime = Date.now();
    const duration = 1500; // 动画持续时间（毫秒）
    const targetHappiness = happiness ?? 0;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easeOutQuad 缓动函数使动画更自然
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentHappiness = Math.round(targetHappiness * easeProgress);
      
      setAnimatedHappiness(currentHappiness);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [happiness]);

  const gradientColor = getBarColor(gender, "gradient").replace("bg-gradient-to-r", "");
  const liquidHeight = `${animatedHappiness}%`;

  // 定义洋红色渐变
  const magentaGradient = {
    start: "from-fuchsia-500",
    end: "to-pink-600"
  };

  return (
    <div className="relative w-48 h-48">
      {/* 心形容器背景 */}
      <svg
        viewBox="0 0 122.88 107.39"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
      >
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#ec4899" }} /> {/* pink-500 */}
            <stop offset="100%" style={{ stopColor: "#db2777" }} /> {/* pink-600 */}
          </linearGradient>
        </defs>
        {/* 心形轮廓 */}
        <path
          d="M60.83,17.18c8-8.35,13.62-15.57,26-17C110-2.46,131.27,21.26,119.57,44.61c-3.33,6.65-10.11,14.56-17.61,22.32-8.23,8.52-17.34,16.87-23.72,23.2l-17.4,17.26L46.46,93.55C29.16,76.89,1,55.92,0,29.94-.63,11.74,13.73.08,30.25.29c14.76.2,21,7.54,30.58,16.89Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/30"
        />
        {/* 液体效果 */}
        <path
          d="M60.83,17.18c8-8.35,13.62-15.57,26-17C110-2.46,131.27,21.26,119.57,44.61c-3.33,6.65-10.11,14.56-17.61,22.32-8.23,8.52-17.34,16.87-23.72,23.2l-17.4,17.26L46.46,93.55C29.16,76.89,1,55.92,0,29.94-.63,11.74,13.73.08,30.25.29c14.76.2,21,7.54,30.58,16.89Z"
          fill="url(#heartGradient)"
          style={{
            clipPath: `inset(${100 - animatedHappiness}% 0 0 0)`,
            transition: "clip-path 0.1s linear"
          }}
        />
      </svg>
      {/* 幸福度数字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white drop-shadow-lg">
          {animatedHappiness}%
        </span>
      </div>
    </div>
  );
};

/**
 * ユーザーまたはパートナーの幸福度を表示するコンポーネント
 */
const UserStatus: React.FC<UserStatusProps> = ({
  happiness,
  gender,
  name,
  isPartner = false,
}) => {
  if (isPartner) {
    return (
      <div className="w-full max-w-xs">
        <div className="text-white mb-4 text-3xl text-center azuki-font">
          {`${name || "相手"}の幸福度`}
        </div>
        <div className="flex justify-center">
          <HeartContainer happiness={happiness ?? 0} gender={gender} />
        </div>
      </div>
    );
  }

  // 保持原有的进度条样式（右上角的小进度条）
  return (
    <div className="w-24">
      <div className="text-white mb-1 text-sm text-right azuki-font">
        {`${name || "自分"}の幸福度`}
      </div>
      <div
        className={`relative w-full h-5 ${getBarColor(
          gender,
          "bg"
        )} rounded-full overflow-hidden ${getBorderColor(gender)}`}
      >
        <div
          className={`h-full ${getBarColor(
            gender,
            "gradient"
          )} rounded-full transition-all duration-500`}
          style={{ width: `${happiness ?? 0}%` }}
        ></div>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
          {happiness ?? 0}%
        </span>
      </div>
    </div>
  );
};

export default UserStatus;
