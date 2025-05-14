import FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { createRef, useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/components/hooks/useAuth";

export const useCalendarFunc = () => {
  const [eventsTitle, setEventsTitle] = useState("");
  const [eventsStartDate, setEventsStartDate] = useState<Date>();
  const [eventsStartTime, setEventsStartTime] = useState("");
  const [isOpenSheet, setIsOpenSheet] = useState<boolean>(false);
  const ref = createRef<FullCalendar>();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { uid } = useAuth();

  // データを取得してカレンダーイベントとして設定
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;
      
      const { data, error } = await supabase
        .from('Action')
        .select(`
          aid,
          action_name,
          happiness_change,
          Calendar (
            timestamp
          )
        `)
        .eq('uid', uid);

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      if (data) {
        // データをカレンダーイベントの形式に変換
        const events = data.flatMap(item => 
          item.Calendar.map(calendar => ({
            id: `${item.aid}-${calendar.timestamp}`,
            title: item.action_name,
            start: calendar.timestamp,
            backgroundColor: item.happiness_change < 0 ? '#e53935' : '#2196f3', // マイナスは赤、プラスは青
            borderColor: item.happiness_change < 0 ? '#e53935' : '#2196f3', // マイナスは赤、プラスは青
            extendedProps: {
              happiness_change: item.happiness_change
            }
          }))
        ).filter(event => event.start); // timestampが存在するイベントのみを表示

        setMyEvents(events);
      }
    };

    fetchData();
  }, [uid]); // uidを依存配列に追加

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr);
    setIsOpen(true);
  };

  const handleSelect = (selectedInfo: any) => {
    const start_date = new Date(selectedInfo.start);
    const start_time = format(start_date, "HH:mm");
    setEventsTitle("");
    setEventsStartDate(start_date);
    setEventsStartTime(start_time);
    setIsOpenSheet(true);
  };

  const onAddEvent = async () => {
    if (!ref.current || !eventsStartDate) {
      return;
    }

    // 開始時間を設定
    const [sh, sm] = eventsStartTime.split(":").map(Number);
    eventsStartDate.setHours(sh);
    eventsStartDate.setMinutes(sm);

    try {
      // actionテーブルからタイトルを取得
      const { data: actionData, error: actionError } = await supabase
        .from('actions')
        .select('title')
        .single();

      if (actionError) {
        throw actionError;
      }

      const event = {
        title: actionData.title,
        start: eventsStartDate.toISOString(),
      };

      // Supabaseにイベントを保存
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([event])
        .select();

      if (error) {
        throw error;
      }

      // 保存したイベントをカレンダーに表示
      const savedEvent = {
        id: data[0].id,
        title: actionData.title,
        start: eventsStartDate,
      };
      
      setMyEvents([...myEvents, savedEvent]);
      ref.current.getApi().addEvent(savedEvent);
      
      // フォームをリセット
      setEventsTitle("");
      setEventsStartDate(undefined);
      setEventsStartTime("");
      setIsOpenSheet(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('イベントの保存に失敗しました');
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsOpen(true);
  };

  return {
    eventsTitle,
    setEventsTitle,
    eventsStartDate,
    setEventsStartDate,
    eventsStartTime,
    setEventsStartTime,
    isOpenSheet,
    setIsOpenSheet,
    handleSelect,
    ref,
    myEvents,
    onAddEvent,
    handleDateClick,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setIsOpen,
    isOpen,
    handleEventClick
  };
};