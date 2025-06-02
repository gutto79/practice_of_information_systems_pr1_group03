import React from "react";
import Modal from "./Modal";

interface BreakupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * パートナー解除確認モーダルコンポーネント
 */
const BreakupModal: React.FC<BreakupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="確認">
      <p className="text-gray-600 mb-6">
        本当にこのパートナーとの関係を解除しますか？
        <br />
        この操作は取り消せません。
      </p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
        >
          キャンセル
        </button>
        <button
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          解除する
        </button>
      </div>
    </Modal>
  );
};

export default BreakupModal;
