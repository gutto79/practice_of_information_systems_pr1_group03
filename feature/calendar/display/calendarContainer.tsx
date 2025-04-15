import React from "react";
import CalendarDisplay from "./calendarDisplay";
import Footer from "@/components/display/Footer";

const CalendarContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <CalendarDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default CalendarContainer;
