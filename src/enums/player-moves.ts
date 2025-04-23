export const PlayerMoves = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UP: "UP",
  DOWN: "DOWN",
  JUMP: "JUMP",
  NONE: "NONE",
} as const

export type PlayerMove = (typeof PlayerMoves)[keyof typeof PlayerMoves]
