import Phaser from "phaser";
import Player from "../../Player";
import PickupItem from "../../PickupItem";
import Enemy from "~/scenes/Enemy";
import { enemies } from "~/config/EnemyConfig";

export default class First extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private penguin?: Phaser.Physics.Matter.Sprite;
  private player!: Player;
  private snowBallShooters: Enemy[] = [];
  private yellowAliens: Enemy[] = [];

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
    this.load.atlas(
      "yellow-alien-animation-frames",
      "assets/animation/enemy/yellow-alien/yellow-alien-animation.png",
      "assets/animation/enemy/yellow-alien/yellow-alien-animation.json"
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

    this.load.audio("background-music", [
      "assets/audio/music/background_music.mp3",
    ]);

    this.load.image("left-button", "assets/controls/left-button.png");
    this.load.image("right-button", "assets/controls/right-button.png");
    this.load.image("jump-button", "assets/controls/jump-button.png");

    this.load.image(
      "snowball",
      "assets/animation/enemy/snow-ball-shooter-animation/snowball.png"
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

      switch (name.trim()) {
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
        case "snowball-shooter": {
          const width = 255;
          const height = 235;

          const enemyConfig = enemies.snowBallShooter(index);
          const snowBallshooterSprite = this.matter.add
            .sprite(x + width / 2, y, enemyConfig.framesKey)
            .setFixedRotation()
            .setScale(72 / width, 64 / height);

          const enemy = new Enemy(
            enemyConfig.id,
            snowBallshooterSprite,
            enemyConfig.animations,
            enemyConfig.shrinkProportion,
            enemyConfig.weapon
          );
          this.snowBallShooters.push(enemy);

          break;
        }
        case "yellow-alien": {
          const enemyConfig = enemies.yellowAlien(index);
          const yellowAlienSprite = this.matter.add
            .sprite(x + width / 2, y, enemyConfig.framesKey)
            .setFixedRotation();

          const enemy = new Enemy(
            enemyConfig.id,
            yellowAlienSprite,
            enemyConfig.animations,
            enemyConfig.shrinkProportion
          );
          this.yellowAliens.push(enemy);

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
    this.sound.play("background-music", { loop: true, volume: 0.3 });
  }

  update(time: number, deltaTime: number) {
    if (
      !this.player &&
      this.snowBallShooters.length &&
      this.yellowAliens.length
    )
      return;

    this.player.update(deltaTime);

    this.snowBallShooters = this.snowBallShooters.filter(
      (snowBallShooter) => !snowBallShooter.wasDestroyed
    );
    this.yellowAliens = this.yellowAliens.filter(
      (yellowAlien) => !yellowAlien.wasDestroyed
    );
    this.snowBallShooters.forEach((snowBallShooter) =>
      snowBallShooter.update(deltaTime)
    );
    this.yellowAliens.forEach((yellowAlien) => yellowAlien.update(deltaTime));

    this.uiLayer.setPosition(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY
    );
  }
}
