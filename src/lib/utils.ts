import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function rgbaToHex(rgba: string): number {
  // Extract numbers from the "rgba(r, g, b, a)" string
  const match = rgba.match(/\d+/g)
  if (!match || match.length < 3) return 0xffffff // Default to white if parsing fails

  // Convert to hexadecimal
  const [r, g, b] = match.map(Number)
  return (r << 16) | (g << 8) | b
}
