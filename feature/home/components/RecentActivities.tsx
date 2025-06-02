import React from "react";
import { RecentAction } from "../types/types";
import { formatRelativeTime } from "../utils/utils";

interface RecentActivitiesProps {
  actions: RecentAction[];
  name: string | null;
}

/**
 * 最近のアクティビティを表示するコンポーネント
 */
const RecentActivities: React.FC<RecentActivitiesProps> = ({ actions, name }) => {
  return (
    <div className="my-4 bg-white rounded-lg shadow p-2">
      <h3 className="text-lg font-medium text-gray-700 mb-2 azuki-font">
        最近の「{name || "自分"}」の行動
      </h3>
      <ul className="space-y-2">
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-lg azuki-font gap-1"
            >
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-gray-600 truncate mr-4">{action.action_name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg whitespace-nowrap w-16 text-right ${
                      action.happiness_change > 0
                        ? "text-pink-500"
                        : "text-blue-500"
                    }`}
                  >
                    {action.happiness_change > 0 ? "+" : ""}
                    {action.happiness_change}
                  </span>
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {formatRelativeTime(action.timestamp)}
                  </span>
                </div>
              </div>
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
