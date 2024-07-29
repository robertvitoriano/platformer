import StateMachine from "~/state-machine/StateMachine";
import Player from "./Player";
import { AnimationConfig } from "~/config/EnemyConfig";

export default class Enemy {
  private sprite: Phaser.Physics.Matter.Sprite;
  private animations: AnimationConfig[] = [];
  private stateMachine: StateMachine | null = null;
  private isTouchingGround: boolean = false;
  private mainSpeed = 3;
  private YPosition: number = 0;
  private id!: string;
  private destroyed: boolean = false;
  private shrunk: boolean = false;
  private timesHitByPlayer = 0;
  private isBeingHit = false;
  private shrinkProportion = 0.5;
  private playerDetected = false;
  private weapon?: any;
  private weaponSprite?: Phaser.Physics.Matter.Sprite;
  private shootEvent?: Phaser.Time.TimerEvent;
  private playerWasShot: boolean = false;
  constructor(
    id: string,
    sprite: Phaser.Physics.Matter.Sprite,
    animations: AnimationConfig[],
    shrinkProportion: number,
    weapon?: any
  ) {
    this.id = id;
    this.sprite = sprite;
    this.animations = animations;
    this.YPosition = this.sprite.y;
    this.shrinkProportion = shrinkProportion;
    this.weapon = weapon;
    this.createAnimations();

    this.sprite.setOnCollide(this.handleCollisions.bind(this));

    this.setupStateMachine();
    if (weapon) {
      this.startShooting();
    }
  }

  private instantiateWeapon() {
    this.weaponSprite = this.sprite.scene.matter.add
      .sprite(
        this.sprite.x + this.sprite.width / 2 - 30,
        this.sprite.y * 1.02,
        this.weapon.frameKey
      )
      .setFixedRotation()
      .setScale(0.02);
    this.weaponSprite.setIgnoreGravity(true);
    this.weaponSprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (
          bodyA.gameObject?.texture?.key === "penguin-animation-frames" ||
          bodyB.gameObject?.texture?.key === "penguin-animation-frames"
        ) {
          const player = Player.getInstance();

          this.weaponSprite?.destroy();
          player.handlePlayerDamage();
          this.sprite.scene.sound.play("snowball-trow-sound");
          this.playerWasShot = true;
        }
      }
    );
  }

  private handleWeaponMovement() {
    if (this.weaponSprite && this.weapon && !this.playerWasShot) {
      const player = Player.getInstance();
      if (player) {
        const direction = new Phaser.Math.Vector2(
          player.getSprite.x - this.sprite.x,
          player.getSprite.y - this.sprite.y
        );
        direction.normalize();

        const force = direction.scale(this.weapon.speed);
        this.weaponSprite.applyForce(force);
        this.sprite.scene.sound.play("snowball-trow-sound");
      }
    }
  }

  private startShooting() {
    this.shootEvent = this.sprite.scene.time.addEvent({
      delay: 2000,
      callback: this.shootWeapon,
      callbackScope: this,
      loop: true,
    });
  }

  private shootWeapon() {
    if (this.weaponSprite) {
      this.weaponSprite.destroy();
    }
    this.instantiateWeapon();
    this.handleWeaponMovement();
  }

  private setupStateMachine() {
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

  private handleCollisions({
    bodyA,
    bodyB,
  }: Phaser.Types.Physics.Matter.MatterCollisionData) {
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
      this.handlePlayerCollision();
    }
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
    // this.detectFall();
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
    const player = Player.getInstance();
    if (this.stateMachine?.isCurrentState("idle")) {
      this.sprite.play(this.animations[0].key, true);
    }
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
        this.stateMachine?.setState("run");
        this.handleWeaponMovement();
      }
    }
  }

  private runOnEnter() {
    if (this.destroyed) return;
    this.sprite.play(this.animations[1].key, true);
  }

  private runOnUpdate() {
    if (this.destroyed) return;
    const player = Player.getInstance();
    const isInTheSameHeight = Math.abs(this.sprite.y - player.getSprite.y) < 15;
    if (this.isTouchingGround && this.playerDetected) {
      this.handleRunOnUpdate(player, isInTheSameHeight);
    }
  }

  private handleRunOnUpdate(player: Player, isInTheSameHeight: boolean) {
    if (!isInTheSameHeight) {
      this.stateMachine?.setState("idle");
      this.playerDetected = false;
      return;
    }

    if (player.getSprite.x > this.sprite.x && isInTheSameHeight) {
      this.sprite.setFlipX(true);
      this.sprite.play(this.animations[1].key, true);
      this.sprite.setVelocityX(this.mainSpeed);
    } else if (player.getSprite.x < this.sprite.x && isInTheSameHeight) {
      this.sprite.setFlipX(false);
      this.sprite.play(this.animations[1].key, true);
      this.sprite.setVelocityX(-this.mainSpeed);
    }
  }

  private handlePlayerCollision() {
    const player = Player.getInstance();
    if (this.isTopCollision(player.getSprite) && player.isJumping()) {
      this.handleEnemyDamage();
      return;
    }
  }

  private handleEnemyDamage() {
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
  }

  private destroy() {
    this.destroyed = true;
    this.sprite.destroy();
    if (this.shootEvent) {
      this.shootEvent.remove(false);
    }
  }

  private isTopCollision(playerSprite: Phaser.Physics.Matter.Sprite): boolean {
    if (playerSprite || this.sprite) return playerSprite.y <= this.sprite.y;
    return false;
  }

  private isSideCollision(playerSprite: Phaser.Physics.Matter.Sprite): boolean {
    if (playerSprite || this.sprite)
      return playerSprite.x <= this.sprite.x || this.sprite.x <= playerSprite.x;
    return false;
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
