import { create } from "zustand"

type WebSocketStore = {
  socket: WebSocket | null
  listeners: { [event: string]: ((data: any) => void)[] }
  create: () => void
  addListener: (event: string, callback: (data: any) => void) => void
  removeListener: (event: string, callback: (data: any) => void) => void
}

export const useWebsocketStore = create<WebSocketStore>()((set, get) => ({
  socket: null,
  listeners: {},
  create: () => {
    const socket = new WebSocket("ws://localhost:7777/ws")
    socket.onmessage = (message) => {
      const data = JSON.parse(message.data)
      const eventListeners = get().listeners[data.event] || []
      eventListeners.forEach((callback) => callback(data))
    }
    set({ socket })
  },
  addListener: (event, callback) => {
    const listeners = get().listeners
    if (!listeners[event]) {
      listeners[event] = []
    }
    listeners[event].push(callback)
    set({ listeners })
  },
  removeListener: (event, callback) => {
    const listeners = get().listeners
    if (listeners[event]) {
      listeners[event] = listeners[event].filter((cb) => cb !== callback)
      set({ listeners })
    }
  },
}))
