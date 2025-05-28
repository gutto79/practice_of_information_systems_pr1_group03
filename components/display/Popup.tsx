import { ReactNode } from "react";

type PopUpProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const PopUp = ({ isOpen, onClose, children }: PopUpProps) => {
  return (
    <div className="relative z-[100]">
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 z-[99] bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed left-1/2 top-1/2 z-[100] flex w-[90%] md:w-[80%] -translate-x-1/2 -translate-y-1/2 transform items-center justify-center gap-10 rounded-lg shadow-xl transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {/* ポップアップパネル */}
        <div className="h-auto min-h-[20%] max-h-[80vh] w-full flex-1 rounded-lg bg-white shadow-xl">
          <div className="flex h-full flex-col">
            {/* ヘッダー */}
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={onClose}
                className="text-2xl font-bold text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Close popup"
              >
                ×
              </button>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
              <div className="min-h-0">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
