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

    const buttonWidth = 200
    const buttonHeight = 50
    const buttonX = this.cameras.main.width / 2 - buttonWidth / 2
    const buttonY = this.cameras.main.height / 2 - buttonHeight / 2

    const button = this.add.graphics()
    button.fillStyle(0xa3dbf2, 1)
    button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15)
    button.lineStyle(2, 0xffffff, 1)
    button.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15)
    const buttonHitArea = new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight)
    button.setInteractive(buttonHitArea, Phaser.Geom.Rectangle.Contains)

    button.on("pointerover", () => {
      this.game.canvas.style.cursor = "pointer"
    })
    button.on("pointerout", () => {
      this.game.canvas.style.cursor = "default"
    })
    button.on("pointerdown", this.startGame, this)

    this.add
      .text(this.cameras.main.width / 2, +this.cameras.main.height / 2, "Start", {
        fontSize: "32px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5)
  }

  private startGame() {
    this.scene.start("game")
  }
}
