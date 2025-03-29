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
  }, []);

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center">
      {!gameStateStore.hasStarted && <LoginForm />}
    </div>
  );
}

export default App;
