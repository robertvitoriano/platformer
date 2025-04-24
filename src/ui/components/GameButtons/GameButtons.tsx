import { PlayerMove, PlayerMoves } from "@/enums/player-moves";
import { usePlayerStore } from "@/store/player-store";
import React from "react";

export const GameButtons = () => {
  const playerStore = usePlayerStore();

  const setCommand = (command: PlayerMove) => {
    playerStore.setPlayerMove(command);
  };

  return (
    <div className="absolute bottom-50 left-0 w-full bg-transparent flex justify-around items-center">
      <button
        className="bg-transparent text-white h-80 w-30 rounded"
        onTouchStart={() => setCommand(PlayerMoves.LEFT)}
        onTouchEnd={() => setCommand(PlayerMoves.NONE)}
      >
        Left
      </button>
      <button
        className="bg-transparent text-white rounded-full h-80 w-20"
        onTouchStart={() => setCommand(PlayerMoves.JUMP)}
        onTouchEnd={() => setCommand(PlayerMoves.NONE)}
      >
        Jump
      </button>
      <button
        className="bg-transparent text-white h-80 w-30 rounded"
        onTouchStart={() => setCommand(PlayerMoves.RIGHT)}
        onTouchEnd={() => setCommand(PlayerMoves.NONE)}
      >
        Right
      </button>
    </div>
  );
};
