import Phaser from "phaser";

import GameScene from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 500,
  height: 800,
  physics: {
    default: "matter",
    matter: {
      debug: false,
    },
  },
  scene: [GameScene],
};

export default new Phaser.Game(config);
