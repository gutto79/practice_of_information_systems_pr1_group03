import React from "react";
import CalendarDisplay from "./calendarDisplay";
import Footer from "@/components/display/Footer";
import Header from "@/components/display/header";
const CalendarContainer = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex-1">
        <CalendarDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default CalendarContainer;
