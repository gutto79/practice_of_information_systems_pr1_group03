import React from "react";
import Modal from "./Modal";
import { TimeRange } from "../types/types";

interface TimeRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  onGenerate: () => Promise<void>;
  disabled?: boolean;
  //onGetMovie: () => Promise<void>;
}

/**
 * 時間範囲選択モーダルコンポーネント
 */
const TimeRangeModal: React.FC<TimeRangeModalProps> = ({
  isOpen,
  onClose,
  selectedRange,
  onSelectRange,
  onGenerate,
  disabled = false,
}) => {
  const timeRanges: TimeRange[] = ["1日", "1週間", "1ヶ月"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="時間範囲を選択">
      {/* 時間範囲選択ボタン */}
      <div className="flex justify-between mb-6">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => onSelectRange(range)}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                selectedRange === range
                  ? "bg-purple-500 text-white shadow-md hover:bg-purple-600"
                  : "bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 生成ボタン */}
      <button
        onClick={onGenerate}
        disabled={disabled}
        className={`w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {disabled ? "生成中..." : "生成！"}
      </button>
    </Modal>
  );
};

export default TimeRangeModal;
