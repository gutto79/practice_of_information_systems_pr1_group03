"use client";

import React, { useState } from "react";

// FullCalendarコンポーネント。
import FullCalendar from "@fullcalendar/react";

// FullCalendarで週表示を可能にするモジュール。
import timeGridPlugin from "@fullcalendar/timegrid";

// FullCalendarで月表示を可能にするモジュール。
import dayGridPlugin from "@fullcalendar/daygrid";

// FullCalendarで日付や時間が選択できるようになるモジュール。
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarFunc } from "../hooks/useCalendarFunc";
import EventDetailModal from "../components/EventDetailModal";
import { PopUp } from "@/components/display/Popup";
import CenteredLoadingSpinner from "@/components/ui/centered-loading-spinner";
import "./calendar.css";

const CalendarDisplay = () => {
  const {
    handleSelect,
    ref,
    ourEvents,
    selectedDate,
    selectedEvent,
    setSelectedEvent,
    eventDetailModal,
    handleEventClick,
    loading,
  } = useCalendarFunc();

  // モーダルを閉じる際の処理
  const handleCloseModal = () => {
    setSelectedEvent(null);
    eventDetailModal.closeModal();
  };

  // 初回レンダリング時のローディング状態
  const [initialLoading, setInitialLoading] = useState(true);

  // データが読み込まれたらinitialLoadingをfalseに設定
  React.useEffect(() => {
    if (!loading && ourEvents.length > 0 && initialLoading) {
      // データが読み込まれたらinitialLoadingをfalseに設定
      setInitialLoading(false);
    }
  }, [loading, ourEvents, initialLoading]);

  // データ読み込み中、初回レンダリング時、またはイベントが空の場合はローディングスピナーのみ表示
  if (loading || initialLoading || ourEvents.length === 0) {
    return <CenteredLoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-4 px-8 pt-2 pb-8 relative">
      {/* イベント詳細モーダル */}
      <PopUp isOpen={eventDetailModal.isOpen} onClose={handleCloseModal}>
        <EventDetailModal
          selectedEvent={selectedEvent}
          selectedDate={selectedDate}
        />
      </PopUp>
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
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
            hour12: false,
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
                `,
            };
          }}
        />
      </div>
    </div>
  );
};

export default CalendarDisplay;
