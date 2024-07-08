import Phaser from "phaser";
import StateMachine from "~/state-machine/StateMachine";

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController {
  private sprite: Phaser.Physics.Matter.Sprite;
  private stateMachine: StateMachine;
  private cursors: CursorKeys;
  private mainSpeed = 5;
  private isTouchDevice: boolean;
  private leftButton?: Phaser.GameObjects.Image;
  private rightButton?: Phaser.GameObjects.Image;
  private jumpButton?: Phaser.GameObjects.Image;
  private uiContainer?: Phaser.GameObjects.Container;
  private totalHealth: number = 100;
  private isTouchingGround: boolean = true;
  private hasTouchedLeft?: boolean = false;
  private hasTouchedRight?: boolean = false;

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
        onExit: this.walkOnExit,
      })
      .addState("jump", {
        onEnter: this.jumpOnEnter,
        onUpdate: this.jumpOnUpdate,
        onExit: this.jumpOnExit,
      })
      .setState("idle");

    this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
      if (this.stateMachine.isCurrentState("jump")) {
        this.sprite.play("player-idle");
        this.stateMachine.setState("idle");
        this.isTouchingGround = true;
      }
    });

    this.isTouchDevice = this.checkTouchDevice();

    this.setupUiContainer();

    // if (this.isTouchDevice) {
    this.setupTouchControls();
    // }
  }

  update(deltaTime: number) {
    this.stateMachine.update(deltaTime);
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite;
  }

  private setupUiContainer() {
    this.uiContainer = this.sprite.scene.add.container(0, 0).setScrollFactor(0);
    const healthBar = this.sprite.scene.add.rectangle(
      300,
      100,
      this.totalHealth * 4,
      70,
      0x00ff00
    );
    this.uiContainer.add(healthBar);
  }

  private idleOnEnter() {
    this.sprite.play("player-idle");
    this.sprite.scene.sound.play("jump-fall-sound");
  }

  private idleOnUpdate() {
    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.hasTouchedLeft ||
      this.hasTouchedRight
    ) {
      this.stateMachine.setState("walk");
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState("jump");
    }
  }

  private walkOnEnter() {
    this.sprite.play("player-walk");
    if (this.isTouchingGround) {
      this.sprite.scene.sound.play("foot-steps-sound", { loop: true });
    }
  }

  private walkOnUpdate() {
    if (!this.sprite) return;
    if (this.cursors.left.isDown || this.hasTouchedLeft) {
      this.sprite.setVelocityX(-this.mainSpeed);
      this.sprite.setFlipX(true);
    } else if (this.cursors.right.isDown || this.hasTouchedRight) {
      this.sprite.setVelocityX(this.mainSpeed);
      this.sprite.setFlipX(false);
    } else {
      this.sprite.setVelocityX(0);
      this.stateMachine.setState("idle");
    }
    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (spaceJustPressed) {
      this.stateMachine.setState("jump");
    }
    if (!this.isTouchingGround) {
      this.sprite.scene.sound.stopByKey("foot-steps-sound");
    }
  }

  private walkOnExit() {
    this.hasTouchedLeft = false;
    this.hasTouchedRight = false;
    this.sprite.scene.sound.stopByKey("foot-steps-sound");
  }

  private jumpOnExit() {
    this.isTouchingGround = true;
  }

  private jumpOnEnter() {
    this.sprite.scene.sound.play("jump-sound");
    this.sprite.setVelocityY(-this.mainSpeed * 3);
    this.sprite.play("player-jump");
    this.isTouchingGround = false;
  }

  private jumpOnUpdate() {
    if (this.cursors.left.isDown || this.hasTouchedLeft) {
      this.sprite.setVelocityX(-this.mainSpeed);
      this.sprite.setFlipX(true);
    } else if (this.cursors.right.isDown || this.hasTouchedRight) {
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

  private checkTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  private setupTouchControls() {
    const { width, height } = this.sprite.scene.scale;
    this.leftButton = this.sprite.scene.add
      .image(100, height - 200, "left-button")
      .setInteractive()
      .setAlpha(0.5)
      .on("pointerdown", () => this.onLeftTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.leftButton);

    this.rightButton = this.sprite.scene.add
      .image(width - 100, height - 200, "right-button")
      .setInteractive()
      .setAlpha(0.5)
      .on("pointerdown", () => this.onRightTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.rightButton);

    this.jumpButton = this.sprite.scene.add
      .image(width / 2, height - 100, "jump-button")
      .setInteractive()
      .setAlpha(0.5)
      .on("pointerdown", () => this.onJumpTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.jumpButton);
  }

  private onLeftTouchStart() {
    this.sprite.setVelocityX(-this.mainSpeed);
    this.sprite.setFlipX(true);
    this.stateMachine.setState("walk");
    this.hasTouchedLeft = true;
    this.hasTouchedRight = false;
  }

  private onRightTouchStart() {
    this.sprite.setVelocityX(this.mainSpeed);
    this.sprite.setFlipX(false);
    this.stateMachine.setState("walk");
    this.hasTouchedLeft = false;
    this.hasTouchedRight = true;
  }

  private onJumpTouchStart() {
    if (
      this.stateMachine.isCurrentState("idle") ||
      this.stateMachine.isCurrentState("walk")
    ) {
      this.stateMachine.setState("jump");
    }
  }

  private onTouchEnd() {
    this.sprite.setVelocityX(0);
    if (this.stateMachine.isCurrentState("walk")) {
      this.stateMachine.setState("idle");
      this.hasTouchedLeft = false;
      this.hasTouchedRight = false;
    }
  }
}
