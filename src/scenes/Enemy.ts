import StateMachine from "~/state-machine/StateMachine";
import Player from "./Player";
import { AnimationConfig } from "~/config/EnemyConfig";

export default class Enemy {
  private sprite: Phaser.Physics.Matter.Sprite;
  private animations: AnimationConfig[] = [];
  private stateMachine: StateMachine | null = null;
  private isTouchingGround: boolean = false;
  private mainSpeed = 3;
  private isCollidingWithPlayer = false;
  private YPosition: number = 0;
  private id!: string;
  private destroyed: boolean = false;
  private shrunk: boolean = false;
  private timesHitByPlayer = 0;
  private isBeingHit = false;
  private shrinkProportion = 0.5;

  constructor(
    id: string,
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[],
    shrinkProportion: number
  ) {
    this.id = id;
    this.sprite = sprite;
    this.animations = animations;
    this.YPosition = this.sprite.y;
    this.shrinkProportion = shrinkProportion;
    this.createAnimations();

    this.sprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (!bodyA.gameObject && !bodyB.gameObject) {
          return;
        }

        if (bodyB.gameObject?.tile?.layer?.name === "ground") {
          this.isTouchingGround = true;
        }

        if (
          bodyA.gameObject?.texture?.key === "penguin-animation-frames" ||
          bodyB.gameObject?.texture?.key === "penguin-animation-frames"
        ) {
          const player = Player.getInstance();
          if (this.isTopCollision(player.getSprite) && player.isJumping()) {
            if (this.isBeingHit) {
              return;
            }
            this.isBeingHit = true;
            this.timesHitByPlayer++;
            this.sprite.scene.sound.play("enemy-hit-sound");
            if (!this.shrunk && this.timesHitByPlayer === 1) {
              this.shrink();
              this.shrunk = true;
              this.resetHitStateAfterDelay();
            } else if (this.timesHitByPlayer === 2) {
              this.destroy();
            }
          } else {
            this.isCollidingWithPlayer = true;
            this.sprite.setVelocityY(0);
          }
        }
      }
    );

    this.stateMachine = new StateMachine(this, this.id);
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

  public get wasDestroyed(): boolean {
    return this.destroyed;
  }

  public update(deltaTime: number) {
    if (this.destroyed) return;
    this.stateMachine?.update(deltaTime);
    this.detectFall();
  }

  private detectFall() {
    const differenceInYToDetectFall = 50;
    const screenHeight = this.sprite.scene.scale.height;
    if (this.sprite.y - this.YPosition >= differenceInYToDetectFall) {
      this.isTouchingGround = false;
      this.sprite.setVelocityY(this.mainSpeed * 2);
    }
    if (this.sprite.y > screenHeight * 4) {
      this.destroy();
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
    if (this.destroyed) return;
    this.sprite.play(this.animations[0].key, true);
  }

  private idleOnUpdate() {
    if (this.destroyed) return;
    const distanceToStartToFollow = 320;
    const distanceToResetCollision = 30;
    const player = Player.getInstance();
    if (this.stateMachine?.isCurrentState("idle")) {
      this.sprite.play(this.animations[0].key, true);
    }
    if (player) {
      const distanceX = Math.abs(this.sprite.x - player.getSprite.x);
      const distanceY = Math.abs(this.sprite.y - player.getSprite.y);

      if (distanceX > distanceToResetCollision) {
        this.isCollidingWithPlayer = false;
      }
      if (
        distanceX <= distanceToStartToFollow &&
        distanceY < 15 &&
        !this.isCollidingWithPlayer
      ) {
        this.stateMachine?.setState("run");
      }
    }
  }

  private runOnEnter() {
    if (this.destroyed) return;
    this.sprite.play(this.animations[1].key, true);
  }

  private runOnUpdate() {
    if (this.destroyed) return;
    if (this.isCollidingWithPlayer) {
      this.stateMachine?.setState("idle");
      return;
    }
    const player = Player.getInstance();
    const distanceY = Math.abs(this.sprite.y - player.getSprite.y);

    if (this.isTouchingGround && distanceY < 15) {
      if (player.getSprite.x > this.sprite.x) {
        this.sprite.setFlipX(true);
        this.sprite.play(this.animations[1].key, true);
        this.sprite.setVelocityX(this.mainSpeed);
      } else if (player.getSprite.x < this.sprite.x) {
        this.sprite.setFlipX(false);
        this.sprite.play(this.animations[1].key, true);
        this.sprite.setVelocityX(-this.mainSpeed);
      }
    } else {
      this.stateMachine?.setState("idle");
    }
  }

  private destroy() {
    this.destroyed = true;
    this.sprite.destroy();
  }

  private isTopCollision(playerSprite: Phaser.Physics.Matter.Sprite): boolean {
    return playerSprite.y <= this.sprite.y;
  }

  private shrink() {
    this.sprite.setScale(this.shrinkProportion).setFixedRotation();
    console.log("enemy shrunk to half size");
  }

  private resetHitStateAfterDelay() {
    this.sprite.scene.time.delayedCall(1000, () => {
      this.isBeingHit = false;
    });
  }
}
