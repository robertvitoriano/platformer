import { PlayerMoves } from "@/enums/player-moves";
import { usePlayerStore } from "@/store/player-store";
import React from "react";
export const GameButtons = () => {
  const playerStore = usePlayerStore();

  const moveLeft = () => {
    playerStore.setPlayerMove(PlayerMoves.LEFT);
  };
  const moveRight = () => {
    playerStore.setPlayerMove(PlayerMoves.RIGHT);
  };
  const jump = () => {
    playerStore.setPlayerMove(PlayerMoves.JUMP);
  };

  return (
    <div className="absolute bottom-50 left-0 w-full h-[10%] bg-transparent flex justify-around items-center">
      <button className="bg-blue-500 text-white p-10 rounded" onClick={moveLeft}>
        LEFT
      </button>
      <button className="bg-blue-500 text-white p-10 rounded" onClick={jump}>
        JUMP
      </button>
      <button className="bg-blue-500 text-white p-10 rounded" onClick={moveRight}>
        RIGHT
      </button>
    </div>
  );
};
