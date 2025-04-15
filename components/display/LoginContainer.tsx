import React from "react";
import Footer from "./Footer";

const LoginContainer: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      ここがログイン画面のつもりですがフッターを表示させときます。
      <Footer />
    </div>
  );
};

export default LoginContainer;
