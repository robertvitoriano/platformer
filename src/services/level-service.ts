import { api } from "./api"

export const getLevel = async () => {
  const response = await api.get("/load-level")

  return response.data
}
