import React from "react";
import { RecentAction } from "../types/types";
import { formatRelativeTime } from "../utils/utils";

interface RecentActivitiesProps {
  actions: RecentAction[];
}

/**
 * 最近のアクティビティを表示するコンポーネント
 */
const RecentActivities: React.FC<RecentActivitiesProps> = ({ actions }) => {
  return (
    <div className="my-4 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2 azuki-font">
        最近の活動
      </h3>
      <ul className="space-y-2">
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-lg azuki-font"
            >
              <div className="flex items-center">
                <span className="text-gray-600">{action.action_name}</span>
                <span
                  className={`ml-2 text-lg ${
                    action.happiness_change >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {action.happiness_change > 0 ? "+" : ""}
                  {action.happiness_change}
                </span>
              </div>
              <span className="text-gray-400 text-xs">
                {formatRelativeTime(action.timestamp)}
              </span>
            </li>
          ))
        ) : (
          <li className="text-sm text-gray-500 text-center">
            まだ活動がありません
          </li>
        )}
      </ul>
    </div>
  );
};

export default RecentActivities;
