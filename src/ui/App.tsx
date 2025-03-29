import React, { useEffect } from "react";
import { useWebsocketStore } from "../store/websocket-store";

function App() {
  const webSocketStore = useWebsocketStore();
  useEffect(() => {
    webSocketStore.create();
  }, []);

  return (
    <>
      <div></div>
    </>
  );
}

export default App;
