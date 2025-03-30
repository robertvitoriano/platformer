import { api } from "./api"

export const createUser = async ({ username }: { username: string }) => {
  const response = await api.post("/users", { username })

  return response.data
}
