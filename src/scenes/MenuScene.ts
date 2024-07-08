export default class MenuScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("menu");
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.image("menu-background", "assets/bg.png"); // Ensure the correct path and key
  }

  create() {
    // Set the background image
    const bg = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      "menu-background"
    );
    bg.setOrigin(0, 0);

    // Add the start button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.cameras.main.width / 2 - buttonWidth / 2;
    const buttonY = this.cameras.main.height / 2 - buttonHeight / 2;

    // Create a graphics object for the button background
    const button = this.add.graphics();
    button.fillStyle(0x0000ff, 1);
    button.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
    button.lineStyle(2, 0xffffff, 1);
    button.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 15);
    const buttonHitArea = new Phaser.Geom.Rectangle(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    );
    button.setInteractive(buttonHitArea, Phaser.Geom.Rectangle.Contains);

    // Add pointer events to change the cursor
    button.on("pointerover", () => {
      this.game.canvas.style.cursor = "pointer";
    });
    button.on("pointerout", () => {
      this.game.canvas.style.cursor = "default";
    });
    button.on("pointerdown", this.startGame, this);

    // Add text to the button without assigning to a variable
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Start",
        { fontSize: "32px", color: "#fff" }
      )
      .setOrigin(0.5, 0.5);
  }

  private startGame() {
    this.scene.start("game");
  }
}
