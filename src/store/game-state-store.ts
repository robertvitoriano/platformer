import { GameState, GameStates } from "@/enums/game-states"
import { create } from "zustand"

type GameStateStore = {
  state: GameState
  setState: (state: GameState) => void
  hasStarted: boolean
  setHasStarted: (hasStarted: boolean) => void
}

export const useGameStateStore = create<GameStateStore>()((set) => ({
  state: GameStates.NULL,
  setState: (state: GameState) => set(() => ({ state })),
  setHasStarted: (hasStarted: boolean) => set(() => ({ hasStarted })),
  hasStarted: false,
}))
