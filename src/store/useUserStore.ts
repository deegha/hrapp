import {create} from "zustand";
import {TAllUserDetails} from "@/types/user";
import {fetchUser} from "@/services/";

interface UserState {
  user: TAllUserDetails;
  setActiveUser: (empId: string) => void;
  unsetUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {} as TAllUserDetails,

  setActiveUser: async (empId: string) => {
    const userResponse = await fetchUser(empId);

    set({user: userResponse.data});
  },

  unsetUser: () => {
    set({user: {} as TAllUserDetails});
  },
}));
