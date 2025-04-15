import React from "react";
import LoginDisplay from "./loginDisplay";
import Footer from "@/components/display/Footer";

const LoginContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <LoginDisplay />
      </div>
      <Footer />
    </div>
  );
};

export default LoginContainer;
