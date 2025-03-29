import Phaser from "phaser"
import FirstScene from "./scenes/GameScenes/FirstScene/FirstScene"
import MenuScene from "./scenes/MenuScene"
import { useGameStateStore } from "@/store/game-state-store"
import { GameStates } from "@/enums/game-states"

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  scene: [MenuScene, FirstScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
}

const game = new Phaser.Game(config)

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight)
})

const handleMenuDisplay = ({ code }: KeyboardEvent) => {
  if (useGameStateStore.getState().hasStarted) {
    if (
      code.toLocaleLowerCase() === "escape" &&
      useGameStateStore.getState().state !== GameStates.PAUSED
    ) {
      useGameStateStore.getState().setState(GameStates.PAUSED)
    } else if (
      code.toLocaleLowerCase() === "escape" &&
      useGameStateStore.getState().state === GameStates.PAUSED
    ) {
      useGameStateStore.getState().setState(GameStates.PLAYING)
    }
  }
}

window.document.addEventListener("keydown", handleMenuDisplay)

export default game
