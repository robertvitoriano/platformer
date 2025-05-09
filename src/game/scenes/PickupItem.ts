import Phaser from "phaser";

export default class PickupItem {
  private sprite: Phaser.Physics.Matter.Sprite;
  private hasBeenCollected: boolean = false;
  private itemAnimation: string = "";
  get getHasBeenCollected() {
    return this.hasBeenCollected;
  }
  constructor(sprite: Phaser.Physics.Matter.Sprite, itemAnimation: string) {
    this.sprite = sprite;
    this.itemAnimation = itemAnimation;
    this.createAnimations();
    this.sprite.setIgnoreGravity(true);
    this.sprite.play(itemAnimation);
    this.sprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (!bodyA.gameObject && !bodyB.gameObject) return;

        if (
          bodyA.gameObject.texture?.key === "penguin-animation-frames" ||
          bodyB.gameObject.texture?.key === "penguin-animation-frames"
        ) {
          this.sprite.scene.sound.play("coin-picked-sound");
          this.sprite.destroy();

          return;
        }
      }
    );
  }
  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }
  private createAnimations() {
    this.sprite.anims.create({
      key: this.itemAnimation,
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
