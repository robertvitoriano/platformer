import { create } from "zustand"
type WebSocketClient = {
  _webSocketInstance: WebSocket
  on: (event: string, callback: (data: any) => void) => void
  emit: (data: any) => void
}
type WebSocketStore = {
  socket: WebSocketClient | null
  listeners: { [event: string]: (data: any) => void }
  create: () => void
  removeListener: (event: string) => void
}

export const useWebsocketStore = create<WebSocketStore>()((set, get) => ({
  socket: null,
  listeners: {},
  create: () => {
    const socket: WebSocketClient = {
      on: (event, callback) => {
        const listeners = get().listeners

        listeners[event] = callback
        set({ listeners })
      },
      emit(event) {
        const eventDataParsed = JSON.stringify(event)
        this._webSocketInstance.send(eventDataParsed)
      },
      _webSocketInstance: new WebSocket("ws://localhost:7777/ws"),
    }

    socket._webSocketInstance.addEventListener("message", (message) => {
      const data = JSON.parse(message.data)
      const eventListener = get().listeners[data.event]
      if (eventListener) {
        eventListener(data)
      }
    })

    set({ socket })
  },

  removeListener: (event) => {
    const listeners = get().listeners
    if (listeners[event]) {
      delete listeners[event]
      set({ listeners })
    }
  },
}))
