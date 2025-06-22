import Phaser from "phaser"
import Player from "../../Player"
import PickupItem from "../../PickupItem"
import Enemy from "../../Enemy"
import { enemies } from "./../../../config/EnemyConfig"
import { useWebsocketStore } from "../../../../store/websocket-store"
import { useGameStateStore } from "@/store/game-state-store"
import { GameStates } from "@/enums/game-states"
import { GameEmitEvents, GameReceiveEvents } from "@/enums/game-events"
import { useAuthStore } from "@/store/auth-store"
import { getLevel } from "@/services/level-service"

export default class First extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private penguin?: Phaser.Physics.Matter.Sprite
  private player!: Player
  private otherPlayersInitialData: {
    id: string
    position: { x: number; y: number }
    color: string
    username: string
  }[] = []
  private otherPlayers: Player[] = []

  private snowBallShooters: Enemy[] = []
  private yellowAliens: Enemy[] = []

  private coins?: PickupItem[] = []
  private uiLayer!: Phaser.GameObjects.Container
  constructor() {
    super("first-scene")
  }

  init() {
    this.cursors = this.input?.keyboard?.createCursorKeys()!
    
  }

  preload() {
    this.load.atlas(
      "penguin-animation-frames",
      "assets/animation/penguin-animation/penguin-animation.png",
      "assets/animation/penguin-animation/penguin-animation.json"
    )
    this.load.atlas(
      "blue-hexagon-coin",
      "assets/animation/items-animations/coins/blue-coin-hexagon.png",
      "assets/animation/items-animations/coins/blue-coin-hexagon.json"
    )
    this.load.atlas(
      "snowball-shooter-animation-frames",
      "assets/enemy/snow-ball-shooter-animation/snow-ball-shooter-animation.png",
      "assets/enemy/snow-ball-shooter-animation/snow-ball-shooter-animation.json"
    )
    this.load.atlas(
      "yellow-alien-animation-frames",
      "assets/enemy/yellow-alien/yellow-alien-animation.png",
      "assets/enemy/yellow-alien/yellow-alien-animation.json"
    )
    this.load.image("tiles", "assets/sheet.png")
    this.load.image("bg", "assets/bg.png")

    this.load.tilemapTiledJSON("penguin-game-tilemap", "assets/penguin-game-tile.json")
    this.load.audio("jump-sound", [
      "assets/audio/sx/jump/jump.mp3",
      "assets/audio/sx/jump/jump.ogg",
      "assets/audio/sx/jump/jump.wav",
    ])
    this.load.audio("snowball-trow-sound", "assets/audio/sx/snowball-trow-sound.mp3")
    this.load.audio("coin-picked-sound", ["assets/audio/sx/coin-picked.mp3"])
    this.load.audio("foot-steps-sound", ["assets/audio/sx/foot-steps.mp3"])
    this.load.audio("jump-fall-sound", ["assets/audio/sx/jump-fall.mp3"])
    this.load.audio("enemy-hit-sound", ["assets/audio/sx/enemy-hit.ogg"])

    this.load.audio("background-music", ["assets/audio/music/background_music.mp3"])

    this.load.image("left-button", "assets/controls/left-button.png")
    this.load.image("right-button", "assets/controls/right-button.png")
    this.load.image("jump-button", "assets/controls/jump-button.png")

    this.load.image("snowball", "assets/enemy/snow-ball-shooter-animation/snowball.png")
  }

   create() {
    this.registerWebsocketEvents()
    
    const map = this.make.tilemap({ key: "penguin-game-tilemap" })

    const bg = this.add.tileSprite(0, 0, map.widthInPixels, map.heightInPixels, "bg")
    bg.setOrigin(0, 0)
    const tileSet = map.addTilesetImage("iceworld", "tiles")
    
    const tilesetHeight = map.heightInPixels
    
    this.cameras.main.setBounds(0, 0, map.widthInPixels, tilesetHeight)
    this.cameras.main.scrollY = tilesetHeight

    const ground = map.createLayer("ground", tileSet!)
    ground?.setCollisionByProperty({ collides: true })

    const objectsLayer = map.getObjectLayer("objects")

    this.uiLayer = this.add.container()
    
     getLevel().then(({items, enemies:mapEnemies})=>{
      items.forEach((item, index) => {
        const { position:{x,y}, name, size:{width, height}, id } = item
  
        switch (name.trim()) {
          case "blue-coin-hexagon": {
            const coin = this.matter.add.sprite(x + width / 2, y, "blue-hexagon-coin")
            this.coins?.push(new PickupItem(coin, "blue-hexagon-coin-rotation"))
  
            break
          }
        }
      })
      
      mapEnemies.forEach((enemy, index) => {
        const { position:{x,y}, name, size:{width}, id } = enemy
        switch (name.trim()) {
          case "snowball-shooter": {
            const width = 255
            const height = 235
  
            const enemyConfig = enemies.snowBallShooter(index)
            const snowBallshooterSprite = this.matter.add
              .sprite(x + width / 2, y, enemyConfig.framesKey)
              .setFixedRotation()
              .setScale(72 / width, 64 / height)
  
            const enemy = new Enemy(
              enemyConfig.id,
              snowBallshooterSprite,
              enemyConfig.animations,
              enemyConfig.shrinkProportion
            )
            this.snowBallShooters.push(enemy)
  
            break
          }
          case "yellow-alien": {
            const enemyConfig = enemies.yellowAlien(index)
            const yellowAlienSprite = this.matter.add
              .sprite(x + width / 2, y, enemyConfig.framesKey)
              .setFixedRotation()
  
            const enemy = new Enemy(
              enemyConfig.id,
              yellowAlienSprite,
              enemyConfig.animations,
              enemyConfig.shrinkProportion
            )
            this.yellowAliens.push(enemy)
  
            break
          }
        }
      })
     })

    objectsLayer?.objects.forEach((objectData, index) => {
      const { x = 0, y = 0, name, width = 0 } = objectData

      switch (name.trim()) {
        case "spawn-position": {
          const playerXPosition = (x + width) / 2

          const { socket } = useWebsocketStore.getState()

          socket?.emit({
            event: GameEmitEvents.START_GAME,
            token: useAuthStore.getState().token,
            position: { x: playerXPosition, y },
          })

          this.penguin = this.matter.add
            .sprite(playerXPosition, y, "penguin-animation-frames")
            .setFixedRotation()

          this.player = new Player(
            this.penguin,
            this.cursors,
            this.uiLayer,
            useAuthStore.getState().player?.id!,
            useAuthStore.getState().player?.username!,
            useAuthStore.getState().player?.color!
          )

          this.cameras.main.startFollow(this.player.getSprite)

          break
        }
      }
    })
    
    this.matter.world.convertTilemapLayer(ground!)
    this.sound.play("background-music", { loop: true, volume: 0.3 })
  }

  update(_time: number, deltaTime: number) {
    if (
      (!this.player && this.snowBallShooters.length && this.yellowAliens.length) ||
      useGameStateStore.getState().state === GameStates.PAUSED
    )
      return

    this.player.update(deltaTime)

    this.snowBallShooters = this.snowBallShooters.filter(
      (snowBallShooter) => !snowBallShooter.wasDestroyed
    )
    this.yellowAliens = this.yellowAliens.filter((yellowAlien) => !yellowAlien.wasDestroyed)
    this.snowBallShooters.forEach((snowBallShooter) => snowBallShooter.update(deltaTime))
    this.yellowAliens.forEach((yellowAlien) => yellowAlien.update(deltaTime))

    this.uiLayer.setPosition(this.cameras.main.scrollX, this.cameras.main.scrollY)

    const enemies: Enemy[] = [...this.snowBallShooters, ...this.yellowAliens]

    for (const enemy of enemies) {
      enemy.handlePlayerCollision(this.player)
      enemy.handlePlayerDetection(this.player)
    }
    const currentPlayerIds = this.otherPlayers.map((player) => player.getId())
    for (const otherPlayer of this.otherPlayersInitialData) {
      if (!currentPlayerIds.includes(otherPlayer.id)) {
        const otherPlayerSprite = this.matter.add
          .sprite(otherPlayer.position.x, otherPlayer.position.y, "penguin-animation-frames")
          .setFixedRotation()

        this.otherPlayers.push(
          new Player(
            otherPlayerSprite,
            this.cursors,
            this.uiLayer,
            otherPlayer.id,
            otherPlayer.username,
            otherPlayer.color
          )
        )
      }
    }
  }
  
  private registerWebsocketEvents(){
    const webSocketStore = useWebsocketStore.getState()

    webSocketStore.socket!.on("set_initial_players_position", (messageParsed) => {
      const { players } = messageParsed
      this.otherPlayersInitialData = players.filter(
        (player: { id: string }) => player.id !== useAuthStore.getState().player?.id
      )
      const { position } = players.find(
        (player: { id: string; position: { x: number; y: number } }) =>
          player.id === useAuthStore.getState().player?.id
      )

      this.player.getSprite.setX(position.x)
      this.player.getSprite.setY(position.y)
    })
    webSocketStore.socket!.on(GameReceiveEvents.PLAYER_NOT_FOUND, () => {
      localStorage.clear()
      location.reload()
    })
    webSocketStore.socket!.on("update_player_position", (messageParsed) => {
      const { position, id, currentState, isFlipped } = messageParsed
      
      if (id !== useAuthStore.getState().player?.id) {
        const otherPlayerIndex = this.otherPlayers.findIndex(
          (player: any) => player.id === id
        )
        this.otherPlayers[otherPlayerIndex].getSprite.setX(position.x)
        this.otherPlayers[otherPlayerIndex].getSprite.setY(position.y)
        this.otherPlayers[otherPlayerIndex].stateMachine.setState(currentState)
        this.otherPlayers[otherPlayerIndex].getSprite.setFlipX(isFlipped)
        this.otherPlayers[otherPlayerIndex].updateUsernamePosition(position)
      }
    })
  }
}
