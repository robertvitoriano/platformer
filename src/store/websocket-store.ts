import { create } from "zustand"

type WebSocketStore = {
  socket: WebSocket | null
  listeners: { [event: string]: (data: any) => void }
  create: () => void
  addListener: (event: string, callback: (data: any) => void) => void
  removeListener: (event: string) => void
}

export const useWebsocketStore = create<WebSocketStore>()((set, get) => ({
  socket: null,
  listeners: {},
  create: () => {
    const socket = new WebSocket("ws://localhost:7777/ws")
    socket.onmessage = (message) => {
      const data = JSON.parse(message.data)
      const eventListener = get().listeners[data.event] || []

      eventListener(data)
    }
    set({ socket })
  },
  addListener: (event, callback) => {
    const listeners = get().listeners

    listeners[event] = callback
    set({ listeners })
  },
  removeListener: (event) => {
    const listeners = get().listeners
    if (listeners[event]) {
      delete listeners[event]
      set({ listeners })
    }
  },
}))
