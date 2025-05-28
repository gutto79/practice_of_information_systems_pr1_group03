import FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { createRef, useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// 型定義を追加
interface User {
  name: string;
  gender: string;
}

interface Calendar {
  timestamp: string;
}

interface Action {
  aid: string;
  action_name: string;
  happiness_change: number;
  Calendar: Calendar[];
  User: User;
}

type ActionResponse = {
  aid: string;
  action_name: string;
  happiness_change: number;
  Calendar: Calendar[];
  User: User;
};

export const useCalendarFunc = () => {
  const [eventsTitle, setEventsTitle] = useState("");
  const [eventsStartDate, setEventsStartDate] = useState<Date>();
  const [eventsStartTime, setEventsStartTime] = useState("");
  const [isOpenSheet, setIsOpenSheet] = useState<boolean>(false);
  const ref = createRef<FullCalendar>();
  const [ourEvents, setOurEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
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
        console.log("Fetching couple data for uid:", uid);
        // カップルテーブルから相手のuidを取得
        const { data: coupleData, error: coupleError } = await supabase
          .from("Couple")
          .select("uid1, uid2")
          .or(`uid1.eq.${uid},uid2.eq.${uid}`)
          .single();

        if (coupleError) {
          console.error("Error fetching couple data:", coupleError);
          return;
        }

        console.log("Couple data:", coupleData);

        // 相手のuidを特定
        const partnerUid =
          coupleData.uid1 === uid ? coupleData.uid2 : coupleData.uid1;
        console.log("Partner uid:", partnerUid);

        // 自分のイベントを取得
        const { data: myData, error: myError } = await supabase
          .from("Action")
          .select(
            `
            aid,
            action_name,
            happiness_change,
            Calendar (
              timestamp
            ),
            User:User!Action_uid_fkey (
              name,
              gender
            )
          `
          )
          .eq("uid", uid);

        if (myError) {
          console.error("Error fetching my data:", myError);
          return;
        }

        console.log("My events data:", myData);

        // 相手のイベントを取得
        const { data: partnerData, error: partnerError } = await supabase
          .from("Action")
          .select(
            `
            aid,
            action_name,
            happiness_change,
            Calendar (
              timestamp
            ),
            User:User!Action_uid_fkey (
              name,
              gender
            )
          `
          )
          .eq("uid", partnerUid);

        if (partnerError) {
          console.error("Error fetching partner data:", partnerError);
          return;
        }

        console.log("Partner events data:", partnerData);

        // 自分のイベントをカレンダーイベントの形式に変換
        const myEvents = (myData as unknown as ActionResponse[])
          .flatMap((item) => {
            console.log("Processing my event item:", item);
            return item.Calendar.map((calendar) => {
              console.log("Calendar item:", calendar);
              console.log("User data:", item.User);
              return {
                id: `${item.aid}-${calendar.timestamp}`,
                title: item.action_name,
                start: calendar.timestamp,
                backgroundColor:
                  item.User.gender === "male" ? "#2196f3" : "#e53935",
                borderColor:
                  item.User.gender === "male" ? "#2196f3" : "#e53935",
                extendedProps: {
                  happiness_change: item.happiness_change,
                  isPartner: false,
                  userName: item.User.name,
                },
              };
            });
          })
          .filter((event) => event.start);

        console.log("Converted my events:", myEvents);

        // 相手のイベントをカレンダーイベントの形式に変換
        const partnerEvents = (partnerData as unknown as ActionResponse[])
          .flatMap((item) => {
            console.log("Processing partner event item:", item);
            return item.Calendar.map((calendar) => {
              console.log("Calendar item:", calendar);
              console.log("User data:", item.User);
              return {
                id: `partner-${item.aid}-${calendar.timestamp}`,
                title: item.action_name,
                start: calendar.timestamp,
                backgroundColor:
                  item.User.gender === "male" ? "#64b5f6" : "#ff8a80",
                borderColor:
                  item.User.gender === "male" ? "#64b5f6" : "#ff8a80",
                extendedProps: {
                  happiness_change: item.happiness_change,
                  isPartner: true,
                  userName: item.User.name,
                },
              };
            });
          })
          .filter((event) => event.start);

        console.log("Converted partner events:", partnerEvents);

        // 両方のイベントを結合
        const allEvents = [...myEvents, ...partnerEvents];
        console.log("All events to be set:", allEvents);
        setOurEvents(allEvents);
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, [uid]);

  const handleSelect = (selectedInfo: any) => {
    const start_date = new Date(selectedInfo.start);
    const start_time = format(start_date, "HH:mm");
    setEventsTitle("");
    setEventsStartDate(start_date);
    setEventsStartTime(start_time);
    setIsOpenSheet(true);
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsOpen(true);
  };

  return {
    handleSelect,
    ref,
    ourEvents,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setIsOpen,
    isOpen,
    handleEventClick,
  };
};
