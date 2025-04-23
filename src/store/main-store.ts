import { Platform, Platforms } from "@/enums/platforms"
import { create } from "zustand"

type MainStore = {
  platform: Platform
  setPlatform: (state: Platform) => void
}

export const useMainStore = create<MainStore>()((set) => ({
  platform: Platforms.DESKTOP,
  setPlatform: (platform: Platform) => set(() => ({ platform })),
}))
