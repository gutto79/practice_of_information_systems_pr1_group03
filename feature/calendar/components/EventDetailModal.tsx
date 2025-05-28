"use client";

import React from "react";
import { format } from "date-fns";

interface SelectedEvent {
  title: string;
  start: Date;
  extendedProps?: {
    happiness_change?: number;
    isPartner?: boolean;
    userName?: string;
  };
}

interface EventDetailModalProps {
  selectedEvent: SelectedEvent | null;
  selectedDate: string | null;
}

/**
 * カレンダーイベント詳細モーダルの内容コンポーネント
 */
const EventDetailModal: React.FC<EventDetailModalProps> = ({
  selectedEvent,
  selectedDate,
}) => {
  return (
    <div className="p-6">
      {selectedEvent ? (
        <>
          <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
          <p className="mb-2">
            時間: {format(new Date(selectedEvent.start), "yyyy/MM/dd HH:mm")}
          </p>
          {selectedEvent.extendedProps?.happiness_change && (
            <p className="mb-2">
              幸福度の変化: {selectedEvent.extendedProps.happiness_change}
            </p>
          )}
          {selectedEvent.extendedProps?.userName && (
            <p className="mb-2 text-blue-600">
              {selectedEvent.extendedProps.isPartner ? "パートナー" : "あなた"}:{" "}
              {selectedEvent.extendedProps.userName}
            </p>
          )}
        </>
      ) : (
        <h2 className="text-xl font-bold">詳細: {selectedDate}</h2>
      )}
    </div>
  );
};

export default EventDetailModal;
