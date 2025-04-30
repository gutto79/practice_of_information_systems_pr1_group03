'use client';

// FullCalendarコンポーネント。
import FullCalendar from "@fullcalendar/react";

// FullCalendarで週表示を可能にするモジュール。
import timeGridPlugin from "@fullcalendar/timegrid";

// FullCalendarで月表示を可能にするモジュール。
import dayGridPlugin from "@fullcalendar/daygrid";

// FullCalendarで日付や時間が選択できるようになるモジュール。
import interactionPlugin from "@fullcalendar/interaction";

import { ScheduleForm } from "./parts/Form/ScheduleForm";
import { useCalendarFunc } from "../hooks/useCalendarFunc";

const CalendarDisplay = () => {
  const {
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
    ref,
    myEvents,
    onAddEvent, 
    handleDateClick, // 日付詳細表示機能追加
    selectedDate,// 日付詳細表示機能追加
    setIsOpen,// 日付詳細表示機能追加
    isOpen// 日付詳細表示機能追加
  } = useCalendarFunc();
  return (
    <div>
      <ScheduleForm
        title={{ eventsTitle, setEventsTitle }}
        allDay={{ isAllDay, setIsAllDay }}
        startDate={{ eventsStartDate, setEventsStartDate }}
        startTime={{ eventsStartTime, setEventsStartTime }}
        endDate={{ eventsEndDate, setEventsEndDate }}
        endTime={{ eventsEndTime, setEventsEndTime }}
        addEvent={onAddEvent}
      />
      {isOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold">詳細: {selectedDate}</h2>
            {/* ここにその日の予定とかを表示 */}
            <button onClick={() => setIsOpen(false)} className="mt-4">閉じる</button>
          </div>
        </div>
      )}
      <div className="z-10">
      <FullCalendar
        locale="ja" // 言語を日本語に設定
        allDayText="終日" // 「終日」の表示用テキスト
        height="auto" // ヘッダーとフッターを含むカレンダー全体の高さを設定する
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]} // プラグインを読み込む
        initialView="dayGridMonth" // カレンダーが読み込まれたときの初期ビュー
        slotDuration="00:30:00" // タイムスロットを表示する頻度。
        //ユーザーはクリックしてドラッグすることで、複数の日付または時間帯を強調表示できます。
        //ユーザーがクリックやドラッグで選択できるようにするには、インタラクション・プラグインをロードし、このオプションをtrueに設定する必要があります。
        selectable={true}
        dateClick={handleDateClick}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: "00:00",
          endTime: "24:00",
        }} // カレンダーの特定の時間帯を強調します。 デフォルトでは、月曜日から金曜日の午前9時から午後5時までです。
        weekends={true} // カレンダービューに土曜日/日曜日の列を含めるかどうか。
        titleFormat={{
          year: "numeric",
          month: "short",
        }}
        headerToolbar={{
          start: "title", // タイトルを左に表示する。
          center: "prev,next,today", // 「前月を表示」、「次月を表示」、「今日を表示」ができるボタンを画面の中央に表示する。
          end: "dayGridMonth,timeGridWeek", // 月・週表示を切り替えるボタンを表示する。
        }} // headerToolbarのタイトルに表示されるテキストを決定します。
        ref={ref}
        select={handleSelect}
        events={myEvents}
      />
      </div>

    </div>
  );
};

export default CalendarDisplay;
