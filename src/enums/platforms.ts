export const Platforms = {
  DESKTOP: "DESKTOP",
  MOBILE: "MOBILE",
} as const

export type Platform = (typeof Platforms)[keyof typeof Platforms]
