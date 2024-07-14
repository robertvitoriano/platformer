interface AnimationConfig {
  key: string;
  frameRate: number;
  repeat: number;
  framesKey: string;
  prefix: string;
  start: number;
  end: number;
  suffix: string;
}

export default class Enemy {
  private sprite: Phaser.Physics.Matter.Sprite;
  private animations: AnimationConfig[] = [];

  constructor(
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[]
  ) {
    this.sprite = sprite;
    this.animations = animations;

    this.createAnimations();

    this.sprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (!bodyA.gameObject && !bodyB.gameObject) return;

        if (
          bodyA.gameObject.texture?.key === "penguin-animation-frames" ||
          bodyB.gameObject.texture?.key === "penguin-animation-frames"
        ) {
          return;
        }
      }
    );
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }

  private createAnimations() {
    this.animations.forEach((animation) => {
      this.sprite.anims.create({
        key: animation.key,
        repeat: animation.repeat,
        frameRate: animation.frameRate,
        frames: this.sprite.anims.generateFrameNames(animation.framesKey, {
          start: animation.start,
          end: animation.end,
          prefix: animation.prefix,
          suffix: animation.suffix,
        }),
      });
    });
  }
}
