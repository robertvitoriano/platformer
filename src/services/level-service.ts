import { api } from "./api"

type Coordinate = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number; 
}

type Enemy = {
  id: number;
  name: string;
  position: Coordinate;
  killed: boolean;
  size: Size;
};

type Item = {
  id: number;
  name: string;
  position: Coordinate;
  type: string;
  collectedBy: string | null;
  image: string | null;
  size: Size;
};

type LevelData = {
  enemies: Enemy[];
  items: Item[];
};

export const getLevel = async (level = 'level_1'):Promise<LevelData> => {
  const response = await api.post("/load-level",{level_name:level})

  return response.data
}
