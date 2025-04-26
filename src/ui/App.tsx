import React, { useEffect, useState } from "react";
import { useWebsocketStore } from "../store/websocket-store";

import { useGameStateStore } from "@/store/game-state-store";
import { GameStates } from "@/enums/game-states";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { PauseMenu } from "./components/PauseMenu/PauseMenu";
import { useAuthStore } from "@/store/auth-store";
import { useMainStore } from "@/store/main-store";
import { Chat } from "./components/Chat/Chat";
import { Platforms } from "@/enums/platforms";
import { GameButtons } from "./components/GameButtons/GameButtons";
import AudioCaptureButton from "./components/AudioCaptureButton/AudioCaptureButton";
import { useAudioPlayer } from "./components/AudioPlayer/AudioPlayer";

function App() {
  const webSocketStore = useWebsocketStore();
  const gameStateStore = useGameStateStore();
  const authStore = useAuthStore();
  const mainStore = useMainStore();

  useAudioPlayer();

  useEffect(() => {
    webSocketStore.create();
  }, []);

  useEffect(() => {
    if (authStore.token) {
      gameStateStore.setHasStarted(true);
    }
  }, [authStore.token]);

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center relative">
      {!gameStateStore.hasStarted && <LoginForm />}
      {gameStateStore.state === GameStates.PAUSED && <PauseMenu />}
      {mainStore.platform === Platforms.MOBILE && gameStateStore.hasStarted && <GameButtons />}
      {gameStateStore.hasStarted && (
        <>
          <AudioCaptureButton />
          <Chat />
        </>
      )}
    </div>
  );
}

export default App;
