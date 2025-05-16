import { useAuthStore } from "@/store/auth-store"
import { api } from "./api"

export const createPlayer = async ({ username }: { username: string }) => {
  const response = await api.post("/players", { username })

  return response.data
}

export const checkPlayer = async () =>{
  const response = await api.get(`/players/${useAuthStore.getState().player?.id}`)
  
  if (response.status === 401) {
    localStorage.clear()
    window.location.href = "/"
  }

}
