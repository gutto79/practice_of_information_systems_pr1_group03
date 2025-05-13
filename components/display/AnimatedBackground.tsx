import React from "react";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
}) => {
  // 泡の数を定義
  const bubbleCount = 50;

  // 泡の配列を生成
  const bubbles = Array.from({ length: bubbleCount }).map((_, index) => {
    // 各泡にランダムなサイズ、位置、アニメーション遅延を設定
    const size = Math.floor(Math.random() * 30) + 10; // 10px〜40pxのランダムなサイズ
    const left = Math.floor(Math.random() * 100); // 0%〜100%のランダムな水平位置
    const animationDelay = Math.random() * 15; // 0〜15秒のランダムな遅延
    const animationDuration = Math.random() * 5 + 5; // 5〜10秒のランダムなアニメーション時間

    return (
      <div
        key={index}
        className="bubble"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${animationDelay}s`,
          animationDuration: `${animationDuration}s`,
        }}
      ></div>
    );
  });

  return (
    <div className="animated-background-container">
      {/* グラデーション背景 */}
      <div className="animated-background bg-gradient-to-br from-violet-800 via-pink-700 to-orange-700">
        {bubbles}
      </div>
      <div className="content-container">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
