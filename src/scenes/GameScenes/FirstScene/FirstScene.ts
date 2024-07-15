import Phaser from "phaser";
import Player from "../../Player";
import PickupItem from "../../PickupItem";
import Enemy from "~/scenes/Enemy";

export default class First extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private penguin?: Phaser.Physics.Matter.Sprite;
  private player!: Player;
  private snowBallShooters: Enemy[] = [];
  private coins?: PickupItem[] = [];
  private uiLayer!: Phaser.GameObjects.Container;
  constructor() {
    super("game");
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    this.load.atlas(
      "penguin-animation-frames",
      "assets/animation/penguin-animation/penguin-animation.png",
      "assets/animation/penguin-animation/penguin-animation.json"
    );
    this.load.atlas(
      "blue-hexagon-coin",
      "assets/animation/items-animations/coins/blue-coin-hexagon.png",
      "assets/animation/items-animations/coins/blue-coin-hexagon.json"
    );
    this.load.atlas(
      "snowball-shooter-animation-frames",
      "assets/animation/enemy/snow-ball-shooter-animation/snow-ball-shooter-animation.png",
      "assets/animation/enemy/snow-ball-shooter-animation/snow-ball-shooter-animation.json"
    );
    this.load.image("tiles", "assets/sheet.png");
    this.load.image("bg", "assets/bg.png");

    this.load.tilemapTiledJSON(
      "penguin-game-tilemap",
      "assets/penguin-game-tile.json"
    );
    this.load.audio("jump-sound", [
      "assets/audio/sx/jump/jump.mp3",
      "assets/audio/sx/jump/jump.ogg",
      "assets/audio/sx/jump/jump.wav",
    ]);
    this.load.audio("coin-picked-sound", ["assets/audio/sx/coin-picked.mp3"]);
    this.load.audio("foot-steps-sound", ["assets/audio/sx/foot-steps.mp3"]);
    this.load.audio("jump-fall-sound", ["assets/audio/sx/jump-fall.mp3"]);
    this.load.audio("enemy-hit-sound", ["assets/audio/sx/enemy-hit.ogg"]);

    this.load.audio("a-friagem", ["assets/audio/music/a-friagem.mp3"]);

    this.load.image("left-button", "assets/controls/left-button.png");
    this.load.image("right-button", "assets/controls/right-button.png");
    this.load.image("jump-button", "assets/controls/jump-button.png");
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
    const tileSet = map.addTilesetImage("iceworld", "tiles");
    const tilesetHeight = map.heightInPixels;
    this.cameras.main.setBounds(0, 0, map.widthInPixels, tilesetHeight);
    this.cameras.main.scrollY = tilesetHeight;

    const ground = map.createLayer("ground", tileSet);
    ground.setCollisionByProperty({ collides: true });

    const objectsLayer = map.getObjectLayer("objects");
    this.uiLayer = this.add.container();

    objectsLayer.objects.forEach((objectData, index) => {
      const { x = 0, y = 0, name, width = 0 } = objectData;
      switch (name) {
        case "spawn-position": {
          this.penguin = this.matter.add
            .sprite(x + width / 2, y, "penguin-animation-frames")
            .setFixedRotation();
          this.player = Player.getInstance(
            this.penguin,
            this.cursors,
            this.uiLayer
          );

          this.cameras.main.startFollow(this.player.getSprite);

          break;
        }
        case "snowball-shooter-position": {
          const width = 255;
          const height = 235;

          const snowBallshooterSprite = this.matter.add
            .sprite(x + width / 2, y, `snowball-shooter-animation-frames`)
            .setFixedRotation()
            .setScale(72 / width, 64 / height);

          this.snowBallShooters.push(
            new Enemy(`Snowball-shooter-${index}`, snowBallshooterSprite, [
              {
                framesKey: "snowball-shooter-animation-frames",
                key: `snow-ball-shooter-idle-${index}`,
                prefix: "panda_01_idle_0",
                suffix: ".png",
                start: 1,
                end: 3,
                frameRate: 8,
                repeat: -1,
              },
              {
                framesKey: "snowball-shooter-animation-frames",
                key: `snow-ball-shooter-run-${index}`,
                prefix: "panda_01_run_0",
                suffix: ".png",
                start: 1,
                end: 5,
                frameRate: 8,
                repeat: -1,
              },
            ])
          );

          break;
        }
        case "blue-coin-hexagon": {
          const coin = this.matter.add.sprite(
            x + width / 2,
            y,
            "blue-hexagon-coin"
          );
          this.coins?.push(new PickupItem(coin, "blue-hexagon-coin-rotation"));

          break;
        }
      }
    });

    this.matter.world.convertTilemapLayer(ground);
    this.sound.play("a-friagem", { loop: true, volume: 0.3 });
  }

  update(time: number, deltaTime: number) {
    if (!this.player && this.snowBallShooters.length) return;

    this.player.update(deltaTime);

    this.snowBallShooters = this.snowBallShooters.filter(
      (snowBallShooter) => !snowBallShooter.wasDestroyed
    );

    this.snowBallShooters.forEach((snowBallShooter) =>
      snowBallShooter.update(deltaTime)
    );

    this.uiLayer.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );
  }
}
