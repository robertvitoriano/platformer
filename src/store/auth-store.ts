import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Player = {
  id: string
  username: string
  color: string
}

type AuthStore = {
  token: string
  player: Player | null
  setToken: (token: string) => void
  setPlayer: (player: Player) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: "",
      player: null,
      setToken: (token: string) => set(() => ({ token })),
      setPlayer: (player: Player) => set(() => ({ player })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
