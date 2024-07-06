import Phaser from "phaser";
import StateMachine from "~/state-machine/StateMachine";

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

export default class PlayerController {
  private sprite: Phaser.Physics.Matter.Sprite;
  private stateMachine: StateMachine;
  private cursors: CursorKeys;
  private mainSpeed = 5;
  private isTouchDevice: boolean;
  private leftTouchArea?: Phaser.GameObjects.Zone;
  private rightTouchArea?: Phaser.GameObjects.Zone;
  private bottomTouchArea?: Phaser.GameObjects.Zone;
  private hasTouchedLeft?: boolean = false;
  private hasTouchedRight?: boolean = false;
  private uiContainer?: Phaser.GameObjects.Container;
  private totalHealth: number = 100;
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
      })
      .setState("idle");

    this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
      if (this.stateMachine.isCurrentState("jump")) {
        this.sprite.play("player-idle");
        this.stateMachine.setState("idle");
      }
    });

    this.isTouchDevice = this.checkTouchDevice();

    this.setupUiContainer();

    if (this.isTouchDevice) {
      this.setupTouchControls();
    }
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
    if (this.cursors.left.isDown || this.hasTouchedLeft) {
      this.sprite.setVelocityX(-this.mainSpeed);
      this.sprite.setFlipX(true);
      this.stateMachine.setState("walk");
    } else if (this.cursors.right.isDown || this.hasTouchedRight) {
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

  private walkOnExit() {
    this.hasTouchedLeft = false;
    this.hasTouchedRight = false;
  }

  private jumpOnEnter() {
    this.sprite.setVelocityY(-this.mainSpeed * 3);
    this.sprite.play("player-jump");
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
    const touchableWidth = width / 4;

    this.leftTouchArea = this.sprite.scene.add
      .zone(100, height, touchableWidth, height)
      .setOrigin(0)
      .setInteractive()
      .on("pointerdown", () => this.onLeftTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.leftTouchArea);

    this.rightTouchArea = this.sprite.scene.add
      .zone(width - 100, height, touchableWidth, height)
      .setOrigin(0)
      .setInteractive()
      .on("pointerdown", () => this.onRightTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.rightTouchArea);

    this.bottomTouchArea = this.sprite.scene.add
      .zone(0, height, width, 100)
      .setOrigin(0)
      .setInteractive()
      .on("pointerdown", () => this.onJumpTouchStart())
      .on("pointerup", () => this.onTouchEnd());
    this.uiContainer?.add(this.bottomTouchArea);
  }

  // private drawTouchIndicator(x: number, y: number) {
  //   const circle = this.sprite.scene.add.circle(x, y, 50, 0xff0000, 0.5);
  //   this.uiContainer?.add(circle);
  // }

  private onLeftTouchStart() {
    this.sprite.setVelocityX(-this.mainSpeed);
    this.sprite.setFlipX(true);
    this.stateMachine.setState("walk");
    this.hasTouchedLeft = true;
    this.hasTouchedRight = false;
  }

  private onRightTouchStart() {
    this.stateMachine.setState("walk");
    this.sprite.setVelocityX(this.mainSpeed);
    this.sprite.setFlipX(false);
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
    }
  }
}
