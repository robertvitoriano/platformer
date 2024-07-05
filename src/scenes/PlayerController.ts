import Phaser from "phaser";
import StateMachine from "~/state-machine/StateMachine";

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController {
  private sprite: Phaser.Physics.Matter.Sprite;
  private stateMachine: StateMachine;
  private cursors: CursorKeys;
  private mainSpeed = 5;
  constructor(sprite: Phaser.Physics.Matter.Sprite, cursors: CursorKeys) {
    this.sprite = sprite;
    this.cursors = cursors;
    this.createAnimations();

    this.stateMachine = new StateMachine(this, "player");
    this.stateMachine
      .addState("idle", {
        onEnter: this.idleOnEnter,
        onUpdate: this.idleOnUpdate,
      })
      .addState("walk", {
        onEnter: this.walkOnEnter,
        onUpdate: this.walkOnUpdate,
      })
      .addState("jump", {
        onEnter: this.jumpOnEnter,
        onUpdate: this.jumpOnUpdate,
      })
      .setState("idle");

    this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
      if (this.stateMachine.isCurrentState("jump")) {
        this.sprite.play("player-idle");
        this.stateMachine.setState("idle");
      }
    });
  }

  update(deltaTime: number) {
    this.stateMachine.update(deltaTime);
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }

  private idleOnEnter() {
    this.sprite.play("player-idle");
  }
  private idleOnUpdate() {
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
      this.stateMachine.setState("walk");
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState("jump");
    }
  }
  private walkOnEnter() {
    this.sprite.play("player-walk");
  }

  private walkOnUpdate() {
    if (!this.sprite) return;
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-this.mainSpeed);
      this.sprite.setFlipX(true);
      this.stateMachine.setState("walk");
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(this.mainSpeed);
      this.sprite.setFlipX(false);
      this.stateMachine.setState("walk");
    } else {
      this.sprite.setVelocityX(0);
      this.stateMachine.setState("idle");
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState("jump");
    }
  }

  private jumpOnEnter() {
    this.sprite.setVelocityY(-this.mainSpeed * 3);
    this.sprite.play("player-jump");
  }
  jumpOnUpdate() {
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-this.mainSpeed);
      this.sprite.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(this.mainSpeed);
      this.sprite.setFlipX(false);
    }
  }

  private createAnimations() {
    this.sprite.anims.create({
      key: "player-idle",
      frames: [
        { key: "penguin-animation-frames", frame: "penguin_walk01.png" },
      ],
    });

    this.sprite.anims.create({
      key: "player-jump",
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames("penguin-animation-frames", {
        start: 1,
        end: 2,
        prefix: "penguin_jump0",
        suffix: ".png",
      }),
    });

    this.sprite.anims.create({
      key: "player-walk",
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames("penguin-animation-frames", {
        start: 1,
        end: 4,
        prefix: "penguin_walk0",
        suffix: ".png",
      }),
      repeat: -1,
    });
  }
}