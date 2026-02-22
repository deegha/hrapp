import {create} from "zustand";
import {TApproval} from "@/types/";

interface ApprovalState {
  approval: TApproval;
  setActiveApproval: (approval: TApproval) => void;
  unsetApproval: () => void;
}

export const useApprovalStore = create<ApprovalState>((set) => ({
  approval: {} as TApproval,

  setActiveApproval: async (approval: TApproval) => {
    set({approval});
  },

  unsetApproval: () => {
    set({approval: {} as TApproval});
  },
}));
