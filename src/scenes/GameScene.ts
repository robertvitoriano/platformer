import Phaser from "phaser";
import PlayerController from "./PlayerController";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private penguin?: Phaser.Physics.Matter.Sprite;
  private playerController?: PlayerController;

  constructor() {
    super("game");
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.atlas(
      "penguin-animation-frames",
      "assets/penguin-animation/penguin-animation.png",
      "assets/penguin-animation/penguin-animation.json"
    );
    this.load.image("ice-world-tiles", "assets/sheet.png");
    this.load.image("bg", "assets/bg-icebergs-1@2x.png");

    this.load.tilemapTiledJSON(
      "penguin-game-tilemap",
      "assets/penguin-game-tile.json"
    );
  }

  create() {
    const map = this.make.tilemap({ key: "penguin-game-tilemap" });

    const bg = this.add.tileSprite(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels,
      "bg"
    );
    bg.setOrigin(0, 0);

    const tileSet = map.addTilesetImage("iceworld", "ice-world-tiles");

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
            .sprite(x + width / 2, y, "penguin-animation-frames")
            .setFixedRotation();
          this.playerController = new PlayerController(
            this.penguin,
            this.cursors
          );

          this.cameras.main.startFollow(this.playerController.getSprite);

          break;
        }
      }
    });

    this.matter.world.convertTilemapLayer(ground);
  }

  update(time: number, deltaTime: number) {
    if (!this.playerController) return;

    this.playerController.update(deltaTime);
  }
}
