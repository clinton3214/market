import type { Platform } from "@/lib/accounts"

type Props = {
  platform: Platform
  className?: string
}

export function PlatformIcon({ platform, className = "h-5 w-5" }: Props) {
  switch (platform) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      )
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      )
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z" />
        </svg>
      )
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.97-1.54 4.8 4.8 0 0 1-1.12-3.15h-3.61v14.15c0 2.22-1.8 4.03-4.03 4.03s-4.03-1.81-4.03-4.03 1.8-4.03 4.03-4.03c.78 0 1.5.22 2.11.6v-3.8a7.62 7.62 0 0 0-2.11-.31c-4.22 0-7.63 3.41-7.63 7.63s3.41 7.63 7.63 7.63 7.63-3.41 7.63-7.63V9.9a8.4 8.4 0 0 0 4.19 1.12v-3.66a5.55 5.55 0 0 1-.09-.67Z" />
        </svg>
      )
  }
}
