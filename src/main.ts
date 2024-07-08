import Phaser from "phaser";
import FirstScene from "./scenes/GameScenes/FirstScene";
import MenuScene from "./scenes/MenuScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  scene: [MenuScene, FirstScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

export default game;
