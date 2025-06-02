import {create} from "zustand";
import {LeaveRequest} from "@/types/";

interface LeaveRequestState {
  leaveRequest: LeaveRequest;
  setActiveLeaveRequest: (approval: LeaveRequest) => void;
  unsetActiveLeaveRequest: () => void;
}

export const useLeaveRequestStore = create<LeaveRequestState>((set) => ({
  leaveRequest: {} as LeaveRequest,

  setActiveLeaveRequest: async (leaveRequest: LeaveRequest) => {
    set({leaveRequest});
  },

  unsetActiveLeaveRequest: () => {
    set({leaveRequest: {} as LeaveRequest});
  },
}));
