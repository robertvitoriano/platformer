import React, { useEffect } from "react";
import { useWebsocketStore } from "../store/websocket-store";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGameStateStore } from "@/store/game-state-store";
import { GameStates } from "@/enums/game-states";
import { LoginForm } from "./components/LoginForm/LoginForm";
import { PauseMenu } from "./components/PauseMenu/PauseMenu";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

function App() {
  const webSocketStore = useWebsocketStore();
  const gameStateStore = useGameStateStore();
  useEffect(() => {
    webSocketStore.create();
    document.addEventListener("keydown", handlePauseMenuShow);
  }, []);

  const handlePauseMenuShow = ({ code }: KeyboardEvent) => {
    if (gameStateStore.hasStarted) {
      if (code.toLocaleLowerCase() === "escape" && gameStateStore.state !== GameStates.PAUSED) {
        gameStateStore.setState(GameStates.PAUSED);
      } else if (
        code.toLocaleLowerCase() === "escape" &&
        gameStateStore.state === GameStates.PAUSED
      ) {
        gameStateStore.setState(GameStates.PLAYING);
      }
    }
  };

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      {!gameStateStore.hasStarted && <LoginForm />}
      {gameStateStore.state === GameStates.PAUSED && <PauseMenu />}
    </div>
  );
}

export default App;
