// stores/confirmationModalStore.ts
import {create} from "zustand";

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  openModal: (params: {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  closeModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: () => {},
  onCancel: undefined,

  openModal: ({title, description, onConfirm, onCancel}) =>
    set({
      isOpen: true,
      title,
      description,
      onConfirm,
      onCancel,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: () => {},
      onCancel: undefined,
    }),
}));
