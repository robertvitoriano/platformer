import Phaser from "phaser";
import PlayerController from "./PlayerController";
import ItemController from "./ItemController";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private penguin?: Phaser.Physics.Matter.Sprite;
  private playerController?: PlayerController;
  private coins?: ItemController[] = [];

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
    this.load.atlas(
      "blue-hexagon-coin",
      "assets/items-animations/coins/blue-coin-hexagon.png",
      "assets/items-animations/coins/blue-coin-hexagon.json"
    );
    this.load.image("tiles", "assets/sheet.png");
    this.load.tilemapTiledJSON(
      "penguin-game-tilemap",
      "assets/penguin-game-tile.json"
    );
  }

  create() {
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
            .sprite(x + width / 2, y, "penguin-animation-frames")
            .setFixedRotation();
          this.playerController = new PlayerController(
            this.penguin,
            this.cursors
          );

          this.cameras.main.startFollow(this.playerController.getSprite);

          break;
        }
        case "blue-coin-hexagon": {
          const coin = this.matter.add.sprite(
            x + width / 2,
            y,
            "blue-hexagon-coin"
          );
          this.coins?.push(
            new ItemController(coin, "blue-hexagon-coin-rotation")
          );

          break;
        }
      }
    });

    this.matter.world.convertTilemapLayer(ground);
  }

  update(time: number, deltaTime: number) {
    if (!this.playerController) return;

    this.playerController.update(deltaTime);
    this.coins!.forEach((coin: ItemController) => {
      if (coin.getHasBeenCollected) {
        coin.getSprite.destroy();
      }
    });
  }
}
