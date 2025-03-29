import React from "react";
import { Button } from "../ui/button";
import { useGameStateStore } from "@/store/game-state-store";
import { GameStates } from "@/enums/game-states";
export const PauseMenu = () => {
  const gameStateStore = useGameStateStore();

  const onResume = () => {
    gameStateStore.setState(GameStates.PLAYING);
  };

  return (
    <div>
      <Button
        type="submit"
        className="bg-[0xa3dbf2] p-4 text-2xl cursor-pointer"
        onClick={onResume}
      >
        Resume game
      </Button>
    </div>
  );
};
