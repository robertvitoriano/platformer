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
  animations: AnimationConfig[];
}

export const enemies: Record<string, (index: number) => EnemyConfig> = {
  snowBallShooter: (index: number): EnemyConfig => ({
    id: `snow-ball-shooter-${index}`,
    name: `snow-ball-shooter`,
    framesKey: "snowball-shooter-animation-frames",
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
};
