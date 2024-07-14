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
  private id: string = "Enemy";
  private sprite: Phaser.Physics.Matter.Sprite;
  private animations: AnimationConfig[] = [];
  private stateMachine: StateMachine | null = null;
  private isTouchingGround: boolean = false;
  private mainSpeed = 5;
  private isCollidingWithPlayer = false;
  private YPosition: number = 0;

  constructor(
    id: string,
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[]
  ) {
    this.id = id;
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

  public update(deltaTime: number) {
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

    if (this.sprite.y > screenHeight) {
      this.sprite.destroy();
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
    console.log("Animations created:", this.sprite.anims);
  }

  private idleOnEnter() {
    console.log("Entering idle state:", this.sprite);
    if (this.sprite) this.sprite.play(this.animations[0].key, true);
  }

  private idleOnUpdate() {
    console.log(`ENEMY: ${this.id} Enter in idle state`);
    const distanceToStartToFollow = 320;
    const distnaceToResetCollision = 30;
    const player = Player.getInstance();

    if (this.stateMachine?.isCurrentState("idle")) {
      if (this.sprite) this.sprite.play(this.animations[0].key, true);
    }

    if (player) {
      const distance = Math.abs(this.sprite.x - player.getSprite.x);
      if (distance > distnaceToResetCollision) {
        this.isCollidingWithPlayer = false;
      }
      console.log(`ENEMY: ${this.id} currentDistance: ${distance}`);
      if (distance <= distanceToStartToFollow && !this.isCollidingWithPlayer) {
        console.log(`ENEMY: ${this.id} should run`);
        this.stateMachine?.setState("run");
        console.log(`ENEMY: ${this.id} Enter should run`);
      }
    }
  }

  private runOnEnter() {
    console.log("Entering run state:", this.sprite);
    this.sprite.play(this.animations[1].key, true);
  }

  private runOnUpdate() {
    if (this.isCollidingWithPlayer) {
      this.stateMachine?.setState("idle");
      return;
    }
    if (this.isTouchingGround) {
      if (Player.getInstance().getSprite.x > this.sprite.x) {
        this.sprite.setFlipX(true);
        this.sprite.play(this.animations[1].key, true);
        this.sprite.setVelocityX(this.mainSpeed);
      } else if (Player.getInstance().getSprite.x < this.sprite.x) {
        this.sprite.setFlipX(false);
        this.sprite.play(this.animations[1].key, true);
        this.sprite.setVelocityX(-this.mainSpeed);
      }
    }
  }
}
