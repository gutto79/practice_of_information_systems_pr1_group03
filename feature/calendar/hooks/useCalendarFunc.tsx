import FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { createRef, useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import supabase from "@/lib/supabase";

export const useCalendarFunc = () => {
  const [eventsTitle, setEventsTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [eventsStartDate, setEventsStartDate] = useState<Date>();
  const [eventsStartTime, setEventsStartTime] = useState("");
  const [eventsEndDate, setEventsEndDate] = useState<Date>();
  const [eventsEndTime, setEventsEndTime] = useState("");
  const [isOpenSheet, setIsOpenSheet] = useState<boolean>(false);
  const ref = createRef<FullCalendar>(); // 追加
  const [myEvents, setMyEvents] = useState<any[]>([]); // 追加
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  /**
   * カレンダー上で選択した日付をセットステートに反映する
   * @param selectedInfo
   */

  const handleDateClick = (arg: { dateStr: string }) => {
    // ここでクリックされた日付が取れる
    setSelectedDate(arg.dateStr);
    setIsOpen(true);
  };

  const handleSelect = (selectedInfo: any) => {
    const start_date = new Date(selectedInfo.start);
    const start_time = format(start_date, "HH:mm");
    const end_date = new Date(selectedInfo.end);
    const end_time = format(end_date, "HH:mm");
    setEventsTitle("");
    setIsAllDay(false);
    setEventsStartDate(start_date);
    setEventsStartTime(start_time);
    setEventsEndDate(end_date);
    setEventsEndTime(end_time);
    setIsOpenSheet(true);
  };
  /**
   * フォームに入力したスケジュールをカレンダーに登録する処理
   */
  const onAddEvent = async () => {
    if (!ref.current) {
      return;
    }
    if (!eventsStartDate || !eventsEndDate) {
      return;
    }

    // 開始時間と終了時間はString型のため、一度数値に変換し、Date型であるeventsStartDateとeventsEndDateにセットする
    const [sh, sm] = eventsStartTime.split(":").map(Number);
    const [eh, em] = eventsEndTime.split(":").map(Number);
    eventsStartDate.setHours(sh);
    eventsStartDate.setMinutes(sm);
    eventsEndDate.setHours(eh);
    eventsEndDate.setMinutes(em);

    if (eventsStartDate >= eventsEndDate) {
      alert("開始時間と終了時間を確認してください");
      return;
    }

    const event = {
      id: String(myEvents.length),
      title: eventsTitle,
      start: eventsStartDate,
      end: eventsEndDate,
    };
    setMyEvents([...myEvents, event]);
    // カレンダーに予定を登録して表示するための処理。
    ref.current.getApi().addEvent(event);
  };

  return {
    eventsTitle,
    setEventsTitle,
    isAllDay,
    setIsAllDay,
    eventsStartDate,
    setEventsStartDate,
    eventsEndDate,
    setEventsEndDate,
    eventsStartTime,
    setEventsStartTime,
    eventsEndTime,
    setEventsEndTime,
    isOpenSheet,
    setIsOpenSheet,
    handleSelect,
    ref, // 追加
    myEvents, // 追加
    onAddEvent, // 追加
    handleDateClick, // 日付詳細表示機能追加
    selectedDate,// 日付詳細表示機能追加
    setIsOpen,// 日付詳細表示機能追加
    isOpen// 日付詳細表示機能追加
  };
};