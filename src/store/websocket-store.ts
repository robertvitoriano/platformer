import { create } from "zustand"

type WebSocketStore = {
  socket: WebSocket | null
  create: () => void
}

export const useWebsocketStore = create<WebSocketStore>()((set) => ({
  socket: null,
  create: () => set(() => ({ socket: new WebSocket("ws://localhost:7777/ws") })),
}))
