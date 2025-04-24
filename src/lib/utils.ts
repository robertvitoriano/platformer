import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rgbaToHex(rgba: string): number {
  const match = rgba.match(/\d+/g)
  if (!match || match.length < 3) return 0xffffff

  const [r, g, b] = match.map(Number)
  return (r << 16) | (g << 8) | b
}
