export const GameEmitEvents = {
  START_GAME: "start_game",
} as const

export type GameEmitEvent = (typeof GameEmitEvents)[keyof typeof GameEmitEvents]

export const GameReceiveEvents = {
  INITIAL_POSITION: "initial_position",
} as const

export type GameReceiveEvent = (typeof GameReceiveEvents)[keyof typeof GameReceiveEvents]
