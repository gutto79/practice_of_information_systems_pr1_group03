import React, { ReactNode } from "react";
import { styles } from "../utils/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * 汎用モーダルコンポーネント
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className={styles.modal}
      onClick={(e) => {
        // モーダル外をクリックした場合のみ閉じる
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modalContent}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={styles.modalTitle}>{title}</h3>
          <button
            onClick={onClose}
            className={styles.modalCloseButton}
            aria-label="閉じる"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
