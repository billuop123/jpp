import { create } from "zustand";

interface UserState {
  username: string | null;
  email: string | null;
  role: string | null;
  token: string | null;
  image: string | null;
}

interface UserActions {
  setUserName: (userName: string | null) => void;
  setEmail: (email: string | null) => void;
  setRole: (role: string | null) => void;
  setToken: (token: string | null) => void;
  setImage: (image: string | null) => void;
  setAll: (user: Partial<UserState>) => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  username: null,
  email: null,
  role: null,
  token: null,
  image: null,
};

export const useUser = create<UserStore>((set) => ({
  ...initialState,
  setUserName: (userName) => set({ username: userName }),
  setEmail: (email) => set({ email }),
  setRole: (role) => set({ role }),
  setToken: (token) => set({ token }),
  setImage: (image) => set({ image }),
  setAll: (user) => set((state) => ({ ...state, ...user })),
  reset: () => set(initialState),
}));