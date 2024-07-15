export interface AnimationConfig {
  framesKey: string;
  key: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
}

export interface EnemyConfig {
  id: string;
  name: string;
  framesKey: string;
  shrinkProportion: number;
  animations: AnimationConfig[];
}

export const enemies: Record<string, (index: number) => EnemyConfig> = {
  snowBallShooter: (index: number): EnemyConfig => ({
    id: `snow-ball-shooter-${index}`,
    name: `snow-ball-shooter`,
    framesKey: "snowball-shooter-animation-frames",
    shrinkProportion: 0.2,
    animations: [
      {
        framesKey: "snowball-shooter-animation-frames",
        key: `snow-ball-shooter-idle-${index}`,
        prefix: "panda_01_idle_0",
        suffix: ".png",
        start: 1,
        end: 3,
        frameRate: 8,
        repeat: -1,
      },
      {
        framesKey: "snowball-shooter-animation-frames",
        key: `snow-ball-shooter-run-${index}`,
        prefix: "panda_01_run_0",
        suffix: ".png",
        start: 1,
        end: 5,
        frameRate: 8,
        repeat: -1,
      },
    ],
  }),
  yellowAlien: (index: number): EnemyConfig => ({
    id: `yellow-alien-${index}`,
    name: `yellow-alien`,
    framesKey: "yellow-alien-animation-frames",
    shrinkProportion: 0.7,
    animations: [
      {
        framesKey: "yellow-alien-animation-frames",
        key: `yellow-alien-idle-${index}`,
        prefix: "alienYellow_idle",
        suffix: ".png",
        start: 1,
        end: 3,
        frameRate: 8,
        repeat: -1,
      },
      {
        framesKey: "yellow-alien-animation-frames",
        key: `yellow-alien-walk-${index}`,
        prefix: "alienYellow_walk",
        suffix: ".png",
        start: 1,
        end: 2,
        frameRate: 8,
        repeat: -1,
      },
    ],
  }),
};

export const enemiesFrames = [
  "snowball-shooter-animation-frames",
  "yellow-alien-animation-frames",
];

export const isEnemy = (enemyName: string): boolean => {
  if (!enemyName) return false;
  return enemiesFrames.includes(enemyName);
};
