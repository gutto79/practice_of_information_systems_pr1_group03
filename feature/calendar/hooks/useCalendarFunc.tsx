import FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { createRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as calendarService from "../services/calendarService";

// イベントの型定義
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    happiness_change: number;
    isPartner: boolean;
    userName: string;
  };
}

// 選択されたイベントの型定義
interface SelectedEvent {
  title: string;
  start: Date;
  extendedProps?: {
    happiness_change?: number;
    isPartner?: boolean;
    userName?: string;
  };
}

export const useCalendarFunc = () => {
  const ref = createRef<FullCalendar>();
  const [ourEvents, setOurEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const { uid } = useAuth();

  // データを取得してカレンダーイベントとして設定
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) {
        console.log("No uid available");
        return;
      }

      try {
        // カップルテーブルから相手のuidを取得
        const partnerUid = await calendarService.getCoupleRelationship(uid);
        if (!partnerUid) {
          console.log("No partner found");
          return;
        }

        // 自分のイベントを取得
        const myData = await calendarService.getUserEvents(uid);

        // 相手のイベントを取得
        const partnerData = await calendarService.getPartnerEvents(partnerUid);

        // 自分のイベントをカレンダーイベントの形式に変換
        const myEvents = calendarService.convertToCalendarEvents(myData, false);

        // 相手のイベントをカレンダーイベントの形式に変換
        const partnerEvents = calendarService.convertToCalendarEvents(
          partnerData,
          true
        );

        // 両方のイベントを結合
        const allEvents = [...myEvents, ...partnerEvents];
        setOurEvents(allEvents);
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, [uid]);

  const handleSelect = (selectedInfo: { start: Date }) => {
    // 現在は何もしない
    console.log("Selected date:", format(selectedInfo.start, "yyyy-MM-dd"));
  };

  const handleEventClick = (info: { event: SelectedEvent }) => {
    setSelectedEvent(info.event);
    setIsOpen(true);
  };

  return {
    handleSelect,
    ref,
    ourEvents,
    selectedEvent,
    setSelectedEvent,
    setIsOpen,
    isOpen,
    handleEventClick,
  };
};
