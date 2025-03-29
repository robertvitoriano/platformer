import React, { useEffect } from "react";
import { useWebsocketStore } from "../store/websocket-store";

import { useGameStateStore } from "@/store/game-state-store";
import { GameStates } from "@/enums/game-states";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { PauseMenu } from "./components/PauseMenu/PauseMenu";

function App() {
  const webSocketStore = useWebsocketStore();
  const gameStateStore = useGameStateStore();

  useEffect(() => {
    webSocketStore.create();
  }, []);

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      {!gameStateStore.hasStarted && <LoginForm />}
      {gameStateStore.state === GameStates.PAUSED && <PauseMenu />}
    </div>
  );
}

export default App;
