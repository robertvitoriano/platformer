export const GameEmitEvents = {
  START_GAME: "start_game",
  PLAYER_MOVED: "player_moved",
} as const

export type GameEmitEvent = (typeof GameEmitEvents)[keyof typeof GameEmitEvents]

export const GameReceiveEvents = {
  UPDATE_PLAYER_POSITION: "update_player_position",
  SET_INITIAL_PLAYERS_POSITION: "set_initial_players_position",
} as const

export type GameReceiveEvent = (typeof GameReceiveEvents)[keyof typeof GameReceiveEvents]
