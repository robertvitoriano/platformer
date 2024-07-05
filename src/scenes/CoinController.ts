import Phaser from "phaser";

export default class CoinController {
  private sprite: Phaser.Physics.Matter.Sprite;
  constructor(sprite: Phaser.Physics.Matter.Sprite) {
    this.sprite = sprite;
    this.createAnimations();
    this.sprite.setIgnoreGravity(true);
    this.sprite.play("blue-hexagon-coin-rotation");
  }

  private createAnimations() {
    this.sprite.anims.create({
      key: "blue-hexagon-coin-rotation",
      repeat: -1,
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames("blue-hexagon-coin", {
        start: 1,
        end: 6,
        prefix: "blue_coin_hexagon_",
        suffix: ".png",
      }),
    });
  }
}
