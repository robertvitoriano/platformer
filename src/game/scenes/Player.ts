import Phaser from "phaser"
import { isEnemy } from "../config/EnemyConfig"
import StateMachine from "../state-machine/StateMachine"
import { useAuthStore } from "@/store/auth-store"
import { rgbaToHex } from "@/lib/utils"
import { useWebsocketStore } from "@/store/websocket-store"
import { GameEmitEvents } from "@/enums/game-events"
import { useMainStore } from "@/store/main-store"
import { Platforms } from "@/enums/platforms"
import { usePlayerStore } from "@/store/player-store"
import { PlayerMoves } from "@/enums/player-moves"
type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class Player {
  private id: string = ""
  private sprite: Phaser.Physics.Matter.Sprite
  public stateMachine: StateMachine
  private cursors: CursorKeys
  private mainSpeed = 5
  private isTouchDevice: boolean = false
  private shouldRunRight = false
  private shouldRunLeft = false
  private hasTouchedJump = false
  private username: Phaser.GameObjects.Text
  // private uiContainer?: Phaser.GameObjects.Container
  // private totalHealth = 100
  private isTouchingGround = true
  private uiLayer: Phaser.GameObjects.Container
  private static instance: Player | null = null
  private static hasShrunk: boolean = false
  private static shrinkTimestamp: number = 0

  constructor(
    sprite: Phaser.Physics.Matter.Sprite,
    cursors: CursorKeys,
    uiLayer: Phaser.GameObjects.Container,
    id: string,
    username: string,
    color: string
  ) {
    this.id = id
    this.uiLayer = uiLayer
    this.sprite = sprite
    this.cursors = cursors
    this.createAnimations()

    this.stateMachine = new StateMachine(this, "player")
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
      .setState("idle")

    this.sprite.setOnCollide(
      ({ bodyA, bodyB }: Phaser.Types.Physics.Matter.MatterCollisionData) => {
        if (bodyB?.gameObject?.tile?.layer?.name === "ground") {
          const isCollidingWithCeiling = this.checkCeilingCollision({
            groundYPosition: bodyB?.position.y,
            playerYPosition: bodyA.position.y,
          })
          if (isCollidingWithCeiling) {
            return
          }

          this.isTouchingGround = true
          this.stateMachine.setState("idle")
        }
        if (isEnemy(bodyB?.gameObject?.texture?.key)) {
          if (this.stateMachine.isCurrentState("jump")) {
            this.stateMachine.setState("idle")
            return
          }
          const isSideCollision = this.checkSideCollisionWithEnemy({
            enemyXPosition: bodyB.position.x,
            playerXPosition: bodyA.position.x,
          })
          if (isSideCollision && this.isTouchingGround) {
            this.handlePlayerDamage()
          }
        }
      }
    )

    const usernameX = this.sprite.x - 30
    const usernameY = this.sprite.y - 60

    this.username = this.sprite.scene.add.text(usernameX, usernameY, username as string, {
      fontSize: "20px",
      color: "black",
      fontFamily: "Arial",
      backgroundColor: color,
    })

    this.sprite.setTint(rgbaToHex(color))
  }

  update(deltaTime: number) {
    if (this.sprite.scene.sys.game.device.os.desktop) {
      useMainStore.getState().setPlatform(Platforms.DESKTOP)
    } else {
      useMainStore.getState().setPlatform(Platforms.MOBILE)
      this.isTouchDevice = true
    }
    this.stateMachine.update(deltaTime)

    const usernameX = this.sprite.x - 30
    const usernameY = this.sprite.y - 60

    this.username.x = usernameX
    this.username.y = usernameY
    if (this.isTouchDevice) {
      this.shouldRunLeft = usePlayerStore.getState().playerMove === PlayerMoves.LEFT
      this.shouldRunRight = usePlayerStore.getState().playerMove === PlayerMoves.RIGHT
      this.hasTouchedJump = usePlayerStore.getState().playerMove === PlayerMoves.JUMP
    }
  }

  public updateUsernamePosition(position: { x: number; y: number }) {
    const usernameX = position.x - 30
    const usernameY = position.y - 60

    this.username.x = usernameX
    this.username.y = usernameY
  }

  public get getSprite(): Phaser.Physics.Matter.Sprite {
    return this.sprite
  }

  public isJumping(): boolean {
    return !this.isTouchingGround
  }
  public getId(): string {
    return this.id
  }

  public handlePlayerDamage() {
    const elapsedSincePlayerSizeHasShrunk = this.sprite.scene.time.now - Player.shrinkTimestamp

    if (Player.hasShrunk && elapsedSincePlayerSizeHasShrunk >= 1000) {
      this.handleGameOver()
      Player.shrinkTimestamp = 0
    }
    if (Player.instance) {
      this.blinkPlayerRed()
      Player.hasShrunk = true
      Player.shrinkTimestamp = this.sprite.scene.time.now
      this.sprite.setScale(0.5).setFixedRotation()
    }
  }

  private blinkPlayerRed() {
    const blinkCount = 6
    const blinkDuration = 100
    let blinkIndex = 0

    this.sprite.scene.time.addEvent({
      delay: blinkDuration,
      repeat: blinkCount - 1,
      callback: () => {
        if (blinkIndex % 2 === 0) {
          this.sprite.setTint(0xff0000)
        } else {
          this.sprite.clearTint()
        }
        blinkIndex++
      },
      callbackScope: this,
    })
    this.sprite.clearTint()
  }

  private checkSideCollisionWithEnemy({
    enemyXPosition,
    playerXPosition,
  }: {
    enemyXPosition: number
    playerXPosition: number
  }) {
    if (enemyXPosition || playerXPosition)
      return enemyXPosition <= playerXPosition || playerXPosition <= enemyXPosition
    return false
  }

  private setupUiContainer() {
    // this.uiContainer = this.sprite.scene.add.container(0, 0).setScrollFactor(0)
  }

  private checkCeilingCollision({
    groundYPosition,
    playerYPosition,
  }: {
    groundYPosition: number
    playerYPosition: number
  }) {
    return groundYPosition < playerYPosition
  }

  private idleOnEnter = () => {
    this.sprite.play("player-idle")
    this.sprite.scene.sound.play("jump-fall-sound")
  }

  private idleOnUpdate = () => {
    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.shouldRunRight ||
      this.shouldRunLeft
    ) {
      this.stateMachine.setState("walk")
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || this.hasTouchedJump) {
      this.stateMachine.setState("jump")
      this.hasTouchedJump = false
    }
  }

  private walkOnEnter = () => {
    this.sprite.play("player-walk")
    if (this.isTouchingGround) {
      this.sprite.scene.sound.play("foot-steps-sound", { loop: true })
    }
  }

  private walkOnUpdate = () => {
    if (this.cursors.left.isDown || this.shouldRunLeft) {
      this.sprite.setVelocityX(-this.mainSpeed)
      this.sprite.setFlipX(true)
    } else if (
      this.cursors.right.isDown ||
      this.shouldRunRight ||
      usePlayerStore.getState().playerMove === PlayerMoves.RIGHT
    ) {
      this.sprite.setVelocityX(this.mainSpeed)
      this.sprite.setFlipX(false)
    } else {
      this.sprite.setVelocityX(0)
      this.stateMachine.setState("idle")
    }

    const socket = useWebsocketStore.getState().socket
    const token = useAuthStore.getState().token
    const position = { x: this.sprite.x, y: this.sprite.y }

    socket?.send(
      JSON.stringify({
        isFlipped: this.sprite.flipX,
        event: GameEmitEvents.PLAYER_MOVED,
        currentState: this.stateMachine.getCurrentState()?.name,
        position,
        token,
      })
    )

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) || this.hasTouchedJump) {
      this.stateMachine.setState("jump")
      socket?.send(
        JSON.stringify({
          isFlipped: this.sprite.flipX,
          event: GameEmitEvents.PLAYER_MOVED,
          currentState: this.stateMachine.getCurrentState()?.name,
          position,
          token,
        })
      )
    }
    if (!this.isTouchingGround) {
      this.sprite.scene.sound.stopByKey("foot-steps-sound")
    }
  }

  private walkOnExit = () => {
    this.shouldRunRight = false
    this.sprite.scene.sound.stopByKey("foot-steps-sound")
  }

  private jumpOnEnter = () => {
    this.sprite.scene.sound.play("jump-sound")
    this.sprite.setVelocityY(-this.mainSpeed * 3)
    this.sprite.play("player-jump")
    this.isTouchingGround = false
    this.hasTouchedJump = false
    usePlayerStore.getState().setPlayerMove(PlayerMoves.NONE)
  }

  private jumpOnUpdate = () => {
    if (this.cursors.left.isDown || this.shouldRunLeft) {
      this.sprite.setVelocityX(-this.mainSpeed)
      this.sprite.setFlipX(true)
    } else if (this.cursors.right.isDown || this.shouldRunRight) {
      this.sprite.setVelocityX(this.mainSpeed)
      this.sprite.setFlipX(false)
    }
  }

  private jumpOnExit = () => {}

  private createAnimations() {
    this.sprite.anims.create({
      key: "player-idle",
      frames: [{ key: "penguin-animation-frames", frame: "penguin_walk01.png" }],
    })

    this.sprite.anims.create({
      key: "player-jump",
      frameRate: 10,
      frames: this.sprite.anims.generateFrameNames("penguin-animation-frames", {
        start: 1,
        end: 2,
        prefix: "penguin_jump0",
        suffix: ".png",
      }),
    })

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
    })
  }

  private handleGameOver() {
    const gameOverText = this.sprite.scene.add
      .text(this.sprite.scene.scale.width / 2, this.sprite.scene.scale.height / 2, "Game Over", {
        fontSize: "64px",
        color: "#ff0000",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    const countdownText = this.sprite.scene.add
      .text(
        this.sprite.scene.scale.width / 2,
        this.sprite.scene.scale.height / 2 + 100,
        "Restarting in 3...",
        {
          fontSize: "32px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.sprite.scene.scene.pause()

    let countdown = 3
    const countdownInterval = setInterval(() => {
      countdown--
      countdownText.setText(`Restarting in ${countdown}...`)
      if (countdown === 0) {
        clearInterval(countdownInterval)
        gameOverText.destroy()
        countdownText.destroy()
        this.restartGame()
      }
    }, 1000)
  }

  private restartGame() {
    window.location.reload()
  }
}
