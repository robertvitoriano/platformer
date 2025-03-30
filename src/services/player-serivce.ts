import { api } from "./api"

export const createPlayer = async ({ username }: { username: string }) => {
  const response = await api.post("/players", { username })

  return response.data
}
