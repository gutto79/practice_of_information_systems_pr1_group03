import React, { useEffect, useState } from "react";

// 添加颜色计算函数
const calculateGradientColors = (happiness: number) => {
  // 定义起始颜色（蓝色）和结束颜色（洋红色）
  const startColor = {
    r: 59, // blue-500
    g: 130,
    b: 246,
  };
  const endColor = {
    r: 236, // pink-500
    g: 72,
    b: 153,
  };

  // 计算当前幸福度对应的颜色
  const currentColor = {
    r: Math.round(
      startColor.r + (endColor.r - startColor.r) * (happiness / 100)
    ),
    g: Math.round(
      startColor.g + (endColor.g - startColor.g) * (happiness / 100)
    ),
    b: Math.round(
      startColor.b + (endColor.b - startColor.b) * (happiness / 100)
    ),
  };

  return {
    start: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
    end: `rgb(${Math.min(currentColor.r + 20, 255)}, ${Math.min(
      currentColor.g + 20,
      255
    )}, ${Math.min(currentColor.b + 20, 255)})`,
  };
};

interface UserStatusProps {
  happiness: number | null;
  name: string | null;
  isPartner?: boolean;
}

const HeartContainer: React.FC<{
  happiness: number;
  size?: "small" | "large";
  animate?: boolean;
}> = ({ happiness, size = "large", animate = true }) => {
  const [animatedHappiness, setAnimatedHappiness] = useState(
    animate ? 0 : happiness
  );
  const [gradientColors, setGradientColors] = useState(
    calculateGradientColors(animate ? 0 : happiness)
  );

  useEffect(() => {
    if (!animate) {
      setAnimatedHappiness(happiness);
      setGradientColors(calculateGradientColors(happiness));
      return;
    }

    // 重置动画状态
    setAnimatedHappiness(0);
    // 使用 requestAnimationFrame 实现平滑动画
    const startTime = Date.now();
    const duration = 1500; // 动画持续时间（毫秒）
    const targetHappiness = happiness ?? 0;

    const runAnimation = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 使用 easeOutQuad 缓动函数使动画更自然
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const currentHappiness = Math.round(targetHappiness * easeProgress);

      setAnimatedHappiness(currentHappiness);
      // 更新渐变色
      setGradientColors(calculateGradientColors(currentHappiness));

      if (progress < 1) {
        requestAnimationFrame(runAnimation);
      }
    };

    requestAnimationFrame(runAnimation);
  }, [happiness, animate]);

  const containerSize = size === "small" ? "w-24 h-24" : "w-64 h-64";
  const textSize = size === "small" ? "text-sm" : "text-5xl";

  return (
    <div className={`relative ${containerSize}`}>
      {/* 心形容器背景 */}
      <svg
        viewBox="0 0 122.88 107.39"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))" }}
      >
        <defs>
          <linearGradient
            id={`heartGradient-${size}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: gradientColors.start }} />
            <stop offset="100%" style={{ stopColor: gradientColors.end }} />
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
          fill={`url(#heartGradient-${size})`}
          style={{
            clipPath: `inset(${100 - animatedHappiness}% 0 0 0)`,
            transition: "clip-path 0.1s linear",
          }}
        />
      </svg>
      {/* 幸福度数字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${textSize} font-bold drop-shadow-lg`}
          style={{
            color: size === "large" ? gradientColors.start : "#ffffff",
            ...(size === "large"
              ? {
                  textShadow: `
                -1px -1px 0 #fff,
                1px -1px 0 #fff,
                -1px 1px 0 #fff,
                1px 1px 0 #fff,
                0 0 4px rgba(255,255,255,0.5)
              `,
                }
              : {}),
          }}
        >
          {animatedHappiness}
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
  name,
  isPartner = false,
}) => {
  if (isPartner) {
    return (
      <div className="w-full max-w-xs">
        <div className="text-white mb-4 text-3xl text-center azuki-font">
          {`${name || "相手"}`}
        </div>
        <div className="flex justify-center">
          <HeartContainer
            happiness={happiness ?? 0}
            size="large"
            animate={true}
          />
        </div>
      </div>
    );
  }

  // 右上角的小心形（不显示动画）
  return (
    <div className="w-24">
      <div className="text-white mb-1 text-sm text-center azuki-font">
        {`${name || "自分"}`}
      </div>
      <HeartContainer happiness={happiness ?? 0} size="small" animate={false} />
    </div>
  );
};

export default UserStatus;
export { HeartContainer, calculateGradientColors };
