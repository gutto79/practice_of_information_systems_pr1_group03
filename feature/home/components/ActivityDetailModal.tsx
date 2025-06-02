import React from "react";
import { PopUp } from "@/components/display/Popup";
import { RecentAction } from "../types/types";
import { formatRelativeTime } from "../utils/utils";

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: RecentAction | null;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isOpen,
  onClose,
  activity,
}) => {
  if (!activity) return null;

  return (
    <PopUp isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-800 azuki-font">活动详情</h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-lg break-words">{activity.action_name}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">幸福度变化</span>
            <span
              className={`text-lg font-medium ${
                activity.happiness_change > 0 ? "text-pink-500" : "text-blue-500"
              }`}
            >
              {activity.happiness_change > 0 ? "+" : ""}
              {activity.happiness_change}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">时间</span>
            <span className="text-gray-600">{formatRelativeTime(activity.timestamp)}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </PopUp>
  );
};

export default ActivityDetailModal; 