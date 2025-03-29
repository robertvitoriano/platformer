import { create } from "zustand"

type AuthStore = {
  token: string
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  token: "null",
  setToken: (token: string) => set(() => ({ token })),
}))
