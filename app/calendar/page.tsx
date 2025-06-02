"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CalendarContainer from "@/feature/calendar/display/calendarContainer";
import { usePartnerContext } from "@/hooks/usePartnerContext";

const CalendarPage = () => {
  const { hasPartner, loading } = usePartnerContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPartner) {
      router.push("/home");
    }
  }, [hasPartner, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        読み込み中...
      </div>
    );
  }

  if (!hasPartner) {
    return null; // リダイレクト中は何も表示しない
  }

  return <CalendarContainer />;
};

export default CalendarPage;
