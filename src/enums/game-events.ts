export const GameEmitEvents = {
  START_GAME: "start_game",
  PLAYER_MOVED: "player_moved",
  MESSAGE_SENT: "message_sent",
  AUDIO_CHUNK_SENT: "audio_chunk_sent",
  WEBRTC_CANDIDATE_SENT: "webrtc_candidate_sent",
  WEBRTC_OFFER_SENT: "webrtc_offer_sent",
  WEBRTC_ANSWER_SENT: "webrtc_answer_sent",
} as const

export type GameEmitEvent = (typeof GameEmitEvents)[keyof typeof GameEmitEvents]

export const GameReceiveEvents = {
  UPDATE_PLAYER_POSITION: "update_player_position",
  SET_INITIAL_PLAYERS_POSITION: "set_initial_players_position",
  AUDIO_CHUNK_RECEIVED: "audio_chunk_received",
  WEBRTC_OFFER_RECEIVED: "webrtc_offer_received",
  WEBRTC_ANSWER_RECEIVED: "webrtc_answer_received",
  WEBRTC_CANDIDATE_RECEIVED: "webrtc_candidate_received",
  PLAYER_NOT_FOUND: "player_not_found"
} as const

export type GameReceiveEvent = (typeof GameReceiveEvents)[keyof typeof GameReceiveEvents]
