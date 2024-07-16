import StateMachine from "~/state-machine/StateMachine";
import Player from "./Player";
import { AnimationConfig } from "~/config/EnemyConfig";

export default class Enemy {
  private sprite: Phaser.Physics.Matter.Sprite;
  private animations: AnimationConfig[];
  private stateMachine!: StateMachine;
  private isTouchingGround = false;
  private mainSpeed = 3;
  private initialYPosition: number;
  private id: string;
  private destroyed = false;
  private shrunk = false;
  private timesHitByPlayer = 0;
  private isBeingHit = false;
  private shrinkProportion: number;
  private playerDetected = false;

  constructor(
    id: string,
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[],
    shrinkProportion: number
  ) {
    this.id = id;
    this.sprite = sprite;
    this.animations = animations;
    this.initialYPosition = sprite.y;
    this.shrinkProportion = shrinkProportion;

    this.initSprite();
    this.createAnimations();
    this.initStateMachine();
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }

  public get wasDestroyed(): boolean {
    return this.destroyed;
  }

  public update(deltaTime: number): void {
    if (!this.destroyed) {
      this.stateMachine.update(deltaTime);
      // this.detectFall();
    }
  }

  private initSprite(): void {
    this.sprite.setOnCollide(this.handleCollision.bind(this));
    this.sprite.setFixedRotation();
  }

  private handleCollision({
    bodyA,
    bodyB,
  }: Phaser.Types.Physics.Matter.MatterCollisionData): void {
    if (!bodyA.gameObject && !bodyB.gameObject) return;

    if (bodyB.gameObject?.tile?.layer?.name === "ground") {
      this.isTouchingGround = true;
    }

    const player = Player.getInstance();
    if (
      (bodyA.gameObject?.texture?.key === "penguin-animation-frames" ||
        bodyB.gameObject?.texture?.key === "penguin-animation-frames") &&
      this.isTopCollision(player.getSprite) &&
      player.isJumping()
    ) {
      this.handlePlayerCollision();
    }
  }

  private handlePlayerCollision(): void {
    if (this.isBeingHit) return;

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
  }

  private createAnimations(): void {
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

  private initStateMachine(): void {
    this.stateMachine = new StateMachine(this, this.id);
    this.stateMachine.addState("idle", {
      onEnter: this.idleOnEnter.bind(this),
      onUpdate: this.idleOnUpdate.bind(this),
    });
    this.stateMachine.addState("run", {
      onEnter: this.runOnEnter.bind(this),
      onUpdate: this.runOnUpdate.bind(this),
    });
    this.stateMachine.setState("idle");
  }

  private idleOnEnter(): void {
    if (!this.destroyed) {
      this.sprite.play(this.animations[0].key, true);
    }
  }

  private idleOnUpdate(): void {
    if (this.destroyed) return;

    const distanceToStartToFollow = 320;
    const player = Player.getInstance();

    if (player) {
      const distanceX = Math.abs(this.sprite.x - player.getSprite.x);
      const isInTheSameHeight =
        Math.abs(this.sprite.y - player.getSprite.y) < 15;

      if (
        distanceX <= distanceToStartToFollow &&
        isInTheSameHeight &&
        !this.playerDetected
      ) {
        this.playerDetected = true;
        this.stateMachine.setState("run");
      }
    }
  }

  private runOnEnter(): void {
    if (!this.destroyed) {
      this.sprite.play(this.animations[1].key, true);
    }
  }

  private runOnUpdate(): void {
    if (this.destroyed) return;

    const player = Player.getInstance();
    const isInTheSameHeight = Math.abs(this.sprite.y - player.getSprite.y) < 15;

    if (this.isTouchingGround && this.playerDetected) {
      this.handleRunMovement(player, isInTheSameHeight);
    }
  }

  private handleRunMovement(player: Player, isInTheSameHeight: boolean): void {
    if (player.getSprite.x > this.sprite.x && isInTheSameHeight) {
      this.sprite.setFlipX(true);
      this.sprite.setVelocityX(this.mainSpeed);
    } else if (player.getSprite.x < this.sprite.x && isInTheSameHeight) {
      this.sprite.setFlipX(false);
      this.sprite.setVelocityX(-this.mainSpeed);
    } else if (!isInTheSameHeight) {
      this.stateMachine.setState("idle");
      this.playerDetected = false;
    }

    this.sprite.play(this.animations[1].key, true);
  }

  private destroy(): void {
    this.destroyed = true;
    this.sprite.destroy();
  }

  private isTopCollision(playerSprite: Phaser.Physics.Matter.Sprite): boolean {
    return playerSprite.y <= this.sprite.y;
  }

  private shrink(): void {
    this.sprite.setScale(this.shrinkProportion).setFixedRotation();
    console.log("enemy shrunk to half size");
  }

  private resetHitStateAfterDelay(): void {
    this.sprite.scene.time.delayedCall(1000, () => {
      this.isBeingHit = false;
    });
  }
}
