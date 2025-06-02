import { useState } from "react";

type UseModalReturn = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModal = (): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal,
  };
};
