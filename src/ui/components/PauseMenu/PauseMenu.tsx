import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useGameStateStore } from "@/store/game-state-store";
import { Input } from "../ui/input";
import { GameStates } from "@/enums/game-states";
export const PauseMenu = () => {
  const form = useForm();
  const gameStateStore = useGameStateStore();

  const onSubmit = () => {
    gameStateStore.setState(GameStates.PLAYING);
  };

  return (
    <div>
      <Button
        type="submit"
        className="bg-[0xa3dbf2] p-4 text-2xl cursor-pointer"
        onClick={onSubmit}
      >
        Resume game
      </Button>
    </div>
  );
};
