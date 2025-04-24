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
    <div className="absolute bottom-50 left-0 w-full  bg-transparent flex justify-around items-center">
      <button className="bg-transparent text-white h-80 w-30 rounded" onClick={moveLeft}></button>
      <button className="bg-transparent text-white rounded-full h-80 w-20 " onClick={jump}></button>
      <button className="bg-transparent text-white h-80 w-30 rounded" onClick={moveRight}></button>
    </div>
  );
};
