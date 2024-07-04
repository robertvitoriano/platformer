import Phaser from "phaser";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private penguin?: Phaser.Physics.Matter.Sprite;
  private isTouchingGround = false;

  constructor() {
    super("game");
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.atlas(
      "penguin",
      "assets/penguin-animation/penguin-animation.png",
      "assets/penguin-animation/penguin-animation.json"
    );
    this.load.image("tiles", "assets/sheet.png");
    this.load.tilemapTiledJSON(
      "penguin-game-tilemap",
      "assets/penguin-game-tile.json"
    );
  }

  create() {
    this.createPenguinAnimations();
    const map = this.make.tilemap({ key: "penguin-game-tilemap" });
    const tileSet = map.addTilesetImage("iceworld", "tiles");
    const tilesetHeight = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, map.widthInPixels, tilesetHeight);
    this.cameras.main.scrollY = tilesetHeight;
    const ground = map.createLayer("ground", tileSet);
    ground.setCollisionByProperty({ collides: true });

    const objectsLayer = map.getObjectLayer("objects");

    objectsLayer.objects.forEach((objectData) => {
      const { x = 0, y = 0, name, width = 0 } = objectData;
      switch (name) {
        case "spawn-position": {
          this.penguin = this.matter.add
            .sprite(x + width / 2, y, "penguin")
            .play("player-idle")
            .setFixedRotation();

          this.penguin.setOnCollide((data: MatterJS.ICollisionPair) => {
            this.isTouchingGround = true;
          });
          this.cameras.main.startFollow(this.penguin);

          break;
        }
      }
    });

    this.matter.world.convertTilemapLayer(ground);
  }

  update() {
    if (!this.penguin) return;

    const speed = 5;
    if (this.cursors.left.isDown) {
      this.penguin.play("player-walk", true);
      this.penguin.setVelocityX(-speed);
      this.penguin.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.penguin.play("player-walk", true);
      this.penguin.setVelocityX(speed);
      this.penguin.setFlipX(false);
    } else {
      this.penguin.play("player-idle", true);
      this.penguin.setVelocityX(0);
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);

    if (spaceJustPressed && this.isTouchingGround) {
      this.penguin.setVelocityY(-15);
      this.isTouchingGround = false;
    }
  }

  private createPenguinAnimations() {
    this.anims.create({
      key: "player-idle",
      frames: [{ key: "penguin", frame: "penguin_walk01.png" }],
    });

    this.anims.create({
      key: "player-walk",
      frameRate: 10,
      frames: this.anims.generateFrameNames("penguin", {
        start: 1,
        end: 4,
        prefix: "penguin_walk0",
        suffix: ".png",
      }),
      repeat: -1,
    });
  }
}
