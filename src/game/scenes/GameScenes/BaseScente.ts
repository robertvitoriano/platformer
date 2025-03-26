import Phaser from "phaser"
import Player from "../Player"
import PickupItem from "../PickupItem"
import Enemy from "../Enemy"

export default class BaseScene extends Phaser.Scene {
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  protected penguin?: Phaser.Physics.Matter.Sprite
  protected player!: Player
  protected snowBallShooters: Enemy[] = []
  protected yellowAliens: Enemy[] = []
  protected coins: PickupItem[] = []
  protected uiLayer!: Phaser.GameObjects.Container

  constructor(key: string) {
    super(key)
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys()
  }

  preload() {
    this.loadCommonAssets()
    this.preloadSceneAssets()
  }

  create() {
    this.createCommonElements()
    this.createSceneElements()
  }

  update(_time: number, deltaTime: number) {
    if (!this.player) return

    this.player.update(deltaTime)

    this.snowBallShooters = this.snowBallShooters.filter(
      (snowBallShooter) => !snowBallShooter.wasDestroyed
    )
    this.yellowAliens = this.yellowAliens.filter((yellowAlien) => !yellowAlien.wasDestroyed)
    this.snowBallShooters.forEach((snowBallShooter) => snowBallShooter.update(deltaTime))
    this.yellowAliens.forEach((yellowAlien) => yellowAlien.update(deltaTime))

    this.uiLayer.setPosition(this.cameras.main.scrollX, this.cameras.main.scrollY)
  }

  protected loadCommonAssets() {
    this.load.atlas(
      "penguin-animation-frames",
      "assets/animation/penguin-animation/penguin-animation.png",
      "assets/animation/penguin-animation/penguin-animation.json"
    )
    this.load.image("left-button", "assets/controls/left-button.png")
    this.load.image("right-button", "assets/controls/right-button.png")
    this.load.image("jump-button", "assets/controls/jump-button.png")
  }

  protected preloadSceneAssets() {}

  protected createCommonElements() {
    this.uiLayer = this.add.container()
    this.sound.play("background-music", { loop: true, volume: 0.3 })
  }

  protected createSceneElements() {
    // To be implemented by derived classes
  }
}
