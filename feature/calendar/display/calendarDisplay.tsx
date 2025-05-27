'use client';

// FullCalendarコンポーネント。
import FullCalendar from "@fullcalendar/react";

// FullCalendarで週表示を可能にするモジュール。
import timeGridPlugin from "@fullcalendar/timegrid";

// FullCalendarで月表示を可能にするモジュール。
import dayGridPlugin from "@fullcalendar/daygrid";

// FullCalendarで日付や時間が選択できるようになるモジュール。
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarFunc } from "../hooks/useCalendarFunc";
import { format } from "date-fns";
import "./calendar.css";

const CalendarDisplay = () => {
  const {
    handleSelect,
    ref,
    ourEvents,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    setIsOpen,
    isOpen,
    handleEventClick
  } = useCalendarFunc();

  return (
    <div className="flex flex-col gap-4 px-8 pt-2 pb-8">
      {isOpen && (selectedDate || selectedEvent) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            {selectedEvent ? (
              <>
                <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
                <p className="mb-2">
                  時間: {format(new Date(selectedEvent.start), 'yyyy/MM/dd HH:mm')}
                </p>
                {selectedEvent.extendedProps?.happiness_change && (
                  <p className="mb-2">
                    幸福度の変化: {selectedEvent.extendedProps.happiness_change}
                  </p>
                )}
                {selectedEvent.extendedProps?.userName && (
                  <p className="mb-2 text-blue-600">
                    {selectedEvent.extendedProps.isPartner ? 'パートナー' : 'あなた'}: {selectedEvent.extendedProps.userName}
                  </p>
                )}
              </>
            ) : (
              <h2 className="text-xl font-bold">詳細: {selectedDate}</h2>
            )}
            <button 
              onClick={() => {
                setIsOpen(false);
                setSelectedEvent(null);
              }} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
      <div className="z-10 flex">
          <FullCalendar
            viewClassNames="bg-white"
            locale="ja" // 言語を日本語に設定
            allDayText="終日" // 「終日」の表示用テキスト
            height="auto" // ヘッダーとフッターを含むカレンダー全体の高さを設定する
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]} // プラグインを読み込む
            initialView="dayGridMonth" // カレンダーが読み込まれたときの初期ビュー
            slotDuration="00:30:00" // タイムスロットを表示する頻度。
            //ユーザーはクリックしてドラッグすることで、複数の日付または時間帯を強調表示できます。
            //ユーザーがクリックやドラッグで選択できるようにするには、インタラクション・プラグインをロードし、このオプションをtrueに設定する必要があります。
            selectable={false}
            eventClick={handleEventClick}
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
              start: "title", // ナビゲーションボタンを左に配置
              center: "", // ビュー切り替えボタンを中央に配置
              end: "prev,next dayGridMonth,timeGridWeek today", // タイトルを右に配置
            }}
            ref={ref}
            select={handleSelect}
            events={ourEvents}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
            eventDisplay="block"
            eventContent={(eventInfo) => {
              return {
                html: `
                  <div class="fc-event-main-frame">
                    <div class="fc-event-title-container">
                      <div class="fc-event-title fc-sticky">
                        ${eventInfo.event.title}
                      </div>
                    </div>
                  </div>
                `
              };
            }}
          />
      </div>
    </div>
  );
};

export default CalendarDisplay;
