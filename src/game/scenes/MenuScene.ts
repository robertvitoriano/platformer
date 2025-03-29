import { GameStates } from "@/enums/game-states"
import { useGameStateStore } from "@/store/game-state-store"
import { useWebsocketStore } from "@/store/websocket-store"

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu")
  }

  preload() {
    this.load.image("menu-background", "assets/bg.png")
  }

  create() {
    const bg = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      "menu-background"
    )
    bg.setOrigin(0, 0)
  }
  update(): void {
    if (useGameStateStore.getState().hasStarted) {
      this.scene!.start("first-scene")
    }
  }
  public startGame() {}
}
