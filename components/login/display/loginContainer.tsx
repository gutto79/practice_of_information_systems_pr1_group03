import React from "react";
import LoginDisplay from "./loginDisplay";

const LoginContainer: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1">
        <LoginDisplay />
      </div>
    </div>
  );
};

export default LoginContainer;
