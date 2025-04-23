import { PlayerMove, PlayerMoves } from "@/enums/player-moves"
import { create } from "zustand"

type PlayerStore = {
  playerMove: PlayerMove
  setPlayerMove: (state: PlayerMove) => void
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  playerMove: PlayerMoves.NONE,
  setPlayerMove: (playerMove: PlayerMove) => set(() => ({ playerMove })),
}))
