import { useAuthStore } from "@/store/auth-store"
import axios, { InternalAxiosRequestConfig, AxiosError } from "axios"

export const api = axios.create({
  baseURL: 'https://api.robertvitoriano.com:7777',
})

const requestIntercepter = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = useAuthStore.getState().token
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(requestIntercepter)

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.request.responseURL.includes("/log-out")
    ) {
      console.error("Error response", error.response)
      localStorage.clear()
    }
    return Promise.reject(error)
  }
)
