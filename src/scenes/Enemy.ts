import StateMachine from "~/state-machine/StateMachine";
import Player from "./Player";
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
  private stateMachine: StateMachine | null = null;
  private isTouchingGround: boolean = false;
  private mainSpeed = 5;
  private isCollidingWithPlayer = false;
  private YPosition: number = 0;
  constructor(
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[]
  ) {
    this.sprite = sprite;
    this.animations = animations;
    this.YPosition = this.sprite.y;
    this.createAnimations();

    this.sprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (!bodyA.gameObject && !bodyB.gameObject) {
          return;
        }

        if (bodyB.gameObject?.tile?.layer?.name === "ground") {
          this.isTouchingGround = true;
        }
        if (bodyB.gameObject?.texture?.key === "penguin-animation-frames") {
          this.isCollidingWithPlayer = true;
          this.sprite.setVelocityY(0);
        }
      }
    );
    this.stateMachine = new StateMachine(this, "enemy");
    this.stateMachine.addState("idle", {
      onEnter: this.idleOnEnter,
      onUpdate: this.idleOnUpdate,
    });
    this.stateMachine.addState("run", {
      onEnter: this.runOnEnter,
      onUpdate: this.runOnUpdate,
    });
    this.stateMachine.setState("idle");
    this.sprite.setFixedRotation();
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }
  public update(deltaTime: number) {
    this.stateMachine?.update(deltaTime);
    this.detectFall();
  }

  private detectFall() {
    const differenceInYToDetectFall = 50;
    if (this.sprite.y - this.YPosition >= differenceInYToDetectFall) {
      this.isTouchingGround = false;
      this.sprite.setVelocityY(this.mainSpeed * 2);
    }
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

  private idleOnEnter() {
    this.sprite.play("snow-ball-shooter-idle", true);
  }
  private idleOnUpdate() {
    const player = Player.getInstance();
    if (this.stateMachine?.isCurrentState("idle")) {
      this.sprite.play("snow-ball-shooter-idle", true);
    }
    if (player) {
      const distance = Math.abs(this.sprite.x - player.getSprite.x);
      if (distance > 30) {
        this.isCollidingWithPlayer = false;
      }
      if (distance <= 320 && !this.isCollidingWithPlayer) {
        this.stateMachine?.setState("run");
      }
    }
  }

  private runOnEnter() {
    this.sprite.play("snow-ball-shooter-run", true);
  }
  private runOnUpdate() {
    if (this.isCollidingWithPlayer) {
      this.stateMachine?.setState("idle");

      return;
    }
    if (this.isTouchingGround) {
      if (Player.getInstance().getSprite.x > this.sprite.x) {
        this.sprite.setFlipX(true);
        this.sprite.play("snow-ball-shooter-run", true);
        this.sprite.setVelocityX(this.mainSpeed);
      } else if (Player.getInstance().getSprite.x < this.sprite.x) {
        this.sprite.setFlipX(false);
        this.sprite.play("snow-ball-shooter-run", true);
        this.sprite.setVelocityX(-this.mainSpeed);
      }
    }
  }
}
