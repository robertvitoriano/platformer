export const GameStates = {
  PAUSED: "paused",
  GAME_OVER: "game_over",
  PLAYING: "playing",
  NULL: null,
} as const

export type GameState = (typeof GameStates)[keyof typeof GameStates]
